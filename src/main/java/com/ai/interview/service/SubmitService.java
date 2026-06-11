package com.ai.interview.service;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.UserSubmitMapper;
import com.ai.interview.strategy.ScoringContext;
import com.ai.interview.strategy.ScoringStrategy;
import com.ai.interview.vo.SubmitAnswerVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;

@Service
public class SubmitService {

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private UserSubmitMapper userSubmitMapper;

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	@Resource
	private RateLimitService rateLimitService;

	@Resource
	private ScoringContext scoringContext;

	@Resource
	private WrongBookService wrongBookService;

	@Transactional(rollbackFor = Exception.class)
	public SubmitAnswerVO submitAnswer(SubmitAnswerRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (request.getQuestionId() == null || request.getQuestionId() <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}
		if (request.getSelectedOptionLabel() == null || request.getSelectedOptionLabel().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "请选择答案");
		}
		if (request.getSubmitToken() == null || request.getSubmitToken().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "提交令牌不合法");
		}

		Question question = questionMapper.selectById(request.getQuestionId());
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}
		if (!Integer.valueOf(BusinessConstant.QUESTION_STATUS_ENABLED).equals(question.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "题目已禁用");
		}

		String selectedOptionLabel = request.getSelectedOptionLabel().trim();
		String submitToken = request.getSubmitToken().trim();
		Long userId = StpUtil.getLoginIdAsLong();

		// 限流保护：60 秒内最多提交 5 次
		boolean allowed = rateLimitService.tryAcquire(userId, BusinessConstant.RATE_LIMIT_SUBMIT, 60, 5);
		if (!allowed) {
			throw new BusinessException(ErrorCode.RATE_LIMIT_ERROR);
		}

		// 提交防重/幂等保护：重复 token 优先返回已完成的提交结果。
		String idempotentKey = "submit:idempotent:" + userId + ":" + submitToken;
		Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(idempotentKey, "1", Duration.ofMinutes(10));
		if (Boolean.FALSE.equals(success)) {
			return getDuplicateSubmitResult(userId, request.getQuestionId(), submitToken, question);
		}

		try {
			// 构造基础提交实体，将待评分的数据封装好
			UserSubmit userSubmit = new UserSubmit();
			userSubmit.setUserId(userId);
			userSubmit.setQuestionId(request.getQuestionId());
			userSubmit.setQuestionType(question.getQuestionType());
			userSubmit.setSelectedOptionLabel(selectedOptionLabel);
			userSubmit.setCorrectOptionLabel(question.getCorrectOptionLabel()); // 答案快照
			userSubmit.setSubmitStatus(BusinessConstant.SUBMIT_STATUS_FINISHED);
			userSubmit.setSubmitToken(submitToken);

			// 策略模式动态获取对应判分策略类
			ScoringStrategy scoringStrategy = scoringContext.getStrategy(question.getQuestionType());
			if (scoringStrategy == null) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "未知的题目评分策略");
			}

			// 执行策略评分并回填结果
			userSubmit = scoringStrategy.doScore(question, userSubmit);

			int insertResult = userSubmitMapper.insert(userSubmit);
			if (insertResult != 1) {
				throw new BusinessException(ErrorCode.SYSTEM_ERROR, "提交答案失败");
			}

			// 同步更新艾宾浩斯错题复习状态机
			wrongBookService.updateWrongBookStatus(userId, request.getQuestionId(), userSubmit.getIsCorrect());

			return buildSubmitAnswerVO(userSubmit, question);
		} catch (RuntimeException e) {
			stringRedisTemplate.delete(idempotentKey);
			throw e;
		}
	}

	private SubmitAnswerVO getDuplicateSubmitResult(Long userId, Long questionId, String submitToken, Question question) {
		QueryWrapper<UserSubmit> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("submit_token", submitToken);
		queryWrapper.orderByDesc("create_time");
		queryWrapper.last("LIMIT 1");

		UserSubmit existingSubmit = userSubmitMapper.selectOne(queryWrapper);
		if (existingSubmit == null) {
			throw new BusinessException(ErrorCode.DUPLICATE_SUBMIT_ERROR, "提交正在处理中，请稍后查看结果");
		}
		if (!questionId.equals(existingSubmit.getQuestionId())) {
			throw new BusinessException(ErrorCode.DUPLICATE_SUBMIT_ERROR, "提交令牌已被使用，请刷新后重新提交");
		}
		if (!Integer.valueOf(BusinessConstant.SUBMIT_STATUS_FINISHED).equals(existingSubmit.getSubmitStatus())) {
			throw new BusinessException(ErrorCode.DUPLICATE_SUBMIT_ERROR, "提交正在处理中，请稍后查看结果");
		}
		return buildSubmitAnswerVO(existingSubmit, question);
	}

	private SubmitAnswerVO buildSubmitAnswerVO(UserSubmit userSubmit, Question question) {
		SubmitAnswerVO submitAnswerVO = new SubmitAnswerVO();
		submitAnswerVO.setSubmitId(userSubmit.getId());
		submitAnswerVO.setQuestionId(userSubmit.getQuestionId());
		submitAnswerVO.setIsCorrect(userSubmit.getIsCorrect());
		submitAnswerVO.setScore(userSubmit.getScore());
		submitAnswerVO.setSubmitStatus(userSubmit.getSubmitStatus());
		submitAnswerVO.setSelectedOptionLabel(userSubmit.getSelectedOptionLabel());
		submitAnswerVO.setCorrectOptionLabel(userSubmit.getCorrectOptionLabel());
		submitAnswerVO.setAnalysis(question.getAnalysis());
		return submitAnswerVO;
	}
}
