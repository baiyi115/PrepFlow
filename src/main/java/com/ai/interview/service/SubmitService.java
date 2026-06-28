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
		SubmitValidator.validateSubmitRequest(request);

		Question question = questionMapper.selectById(request.getQuestionId());
		SubmitValidator.validateEnabledQuestion(question);

		Long userId = StpUtil.getLoginIdAsLong();
		String submitToken = request.getSubmitToken().trim();
		checkSubmitRateLimit(userId);

		String idempotentKey = "submit:idempotent:" + userId + ":" + submitToken;
		Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(idempotentKey, "1", Duration.ofMinutes(10));
		if (Boolean.FALSE.equals(success)) {
			return getDuplicateSubmitResult(userId, request.getQuestionId(), submitToken, question);
		}

		try {
			UserSubmit userSubmit = scoreSubmit(userId, request, question);
			saveSubmit(userSubmit);
			wrongBookService.updateWrongBookStatus(userId, request.getQuestionId(), userSubmit.getIsCorrect());
			return SubmitAssembler.toSubmitAnswerVO(userSubmit, question);
		} catch (RuntimeException e) {
			stringRedisTemplate.delete(idempotentKey);
			throw e;
		}
	}

	private void checkSubmitRateLimit(Long userId) {
		boolean allowed = rateLimitService.tryAcquire(userId, BusinessConstant.RATE_LIMIT_SUBMIT, 60, 5);
		if (!allowed) {
			throw new BusinessException(ErrorCode.RATE_LIMIT_ERROR);
		}
	}

	private UserSubmit scoreSubmit(Long userId, SubmitAnswerRequest request, Question question) {
		ScoringStrategy scoringStrategy = scoringContext.getStrategy(question.getQuestionType());
		if (scoringStrategy == null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "未知的题目评分策略");
		}
		return scoringStrategy.doScore(question, SubmitAssembler.toNewSubmit(userId, request, question));
	}

	private void saveSubmit(UserSubmit userSubmit) {
		int insertResult = userSubmitMapper.insert(userSubmit);
		if (insertResult != 1) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "提交答案失败");
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
		return SubmitAssembler.toSubmitAnswerVO(existingSubmit, question);
	}
}
