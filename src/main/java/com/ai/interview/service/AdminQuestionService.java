package com.ai.interview.service;

import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionOptionVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminQuestionService {

	@Resource
	private UserService userService;

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionMapper questionOptionMapper;

	@Resource
	private Cache<String, Object> caffeineCache;

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	/**
	 * 管理员新增题目与选项 (级联写入)
	 */
	@Transactional(rollbackFor = Exception.class)
	public Long addQuestion(AdminAddQuestionRequest request) {
		userService.checkIsAdmin();

		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求参数为空");
		}
		if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目标题不能为空");
		}
		if (request.getContent() == null || request.getContent().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目内容不能为空");
		}
		if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目分类不能为空");
		}
		if (request.getDifficulty() == null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目难度不能为空");
		}
		if (request.getQuestionType() == null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目类型不能为空");
		}
		if (request.getCorrectOptionLabel() == null || request.getCorrectOptionLabel().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案不能为空");
		}
		if (request.getOptions() == null || request.getOptions().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项不能为空");
		}

		Question question = new Question();
		question.setTitle(request.getTitle().trim());
		question.setContent(request.getContent().trim());
		question.setCategory(request.getCategory().trim());
		question.setDifficulty(request.getDifficulty());
		question.setQuestionType(request.getQuestionType());
		question.setCorrectOptionLabel(request.getCorrectOptionLabel() != null ? request.getCorrectOptionLabel().trim() : null);
		question.setAnalysis(request.getAnalysis() != null ? request.getAnalysis().trim() : null);
		question.setStatus(BusinessConstant.QUESTION_STATUS_ENABLED);

		int result = questionMapper.insert(question);
		if (result != 1) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "新增题目失败");
		}

		List<AdminAddOptionRequest> options = request.getOptions();
		boolean hasCorrectOption = false;
		for (AdminAddOptionRequest optReq : options) {
				if (optReq.getOptionLabel() == null || optReq.getOptionLabel().trim().isEmpty()) {
					throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项标识不能为空");
				}
				if (optReq.getOptionContent() == null || optReq.getOptionContent().trim().isEmpty()) {
					throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项内容不能为空");
				}
				if (request.getCorrectOptionLabel().trim().equals(optReq.getOptionLabel().trim())) {
					hasCorrectOption = true;
				}
				QuestionOption option = new QuestionOption();
				option.setQuestionId(question.getId());
				option.setOptionLabel(optReq.getOptionLabel().trim());
				option.setOptionContent(optReq.getOptionContent().trim());
				option.setSortOrder(optReq.getSortOrder() != null ? optReq.getSortOrder() : 0);

				int optResult = questionOptionMapper.insert(option);
				if (optResult != 1) {
					throw new BusinessException(ErrorCode.SYSTEM_ERROR, "插入选项失败");
				}
			}
		if (!hasCorrectOption) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案必须存在于选项中");
		}

		return question.getId();
	}

	/**
	 * 管理员删除题目与选项 (级联逻辑删除，双删题目多级缓存)
	 */
	@Transactional(rollbackFor = Exception.class)
	public void deleteQuestion(Long questionId) {
		userService.checkIsAdmin();

		if (questionId == null || questionId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不能为空或小于等于零");
		}
		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
		}

		questionMapper.deleteById(questionId);
		
		// 使用显式手写的物理删除 SQL，绕开 MyBatis-Plus 的全局逻辑删除逻辑，彻底规避联合唯一索引 Duplicate 冲突。
		questionOptionMapper.deletePhysicallyByQuestionId(questionId);

		String cacheKey = "question:detail:" + questionId;
		caffeineCache.invalidate(cacheKey);
		stringRedisTemplate.delete(cacheKey);
	}

	/**
	 * 管理员查看题目详情，允许返回正确答案和解析。
	 */
	public QuestionDetailVO getQuestionDetail(Long questionId) {
		userService.checkIsAdmin();
		if (questionId == null || questionId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}

		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}

		QueryWrapper<QuestionOption> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("question_id", questionId);
		queryWrapper.orderByAsc("sort_order");

		List<QuestionOption> questionOptions = questionOptionMapper.selectList(queryWrapper);
		List<QuestionOptionVO> optionVOList = new ArrayList<>();
		for (QuestionOption option : questionOptions) {
			QuestionOptionVO optionVO = new QuestionOptionVO();
			optionVO.setOptionLabel(option.getOptionLabel());
			optionVO.setOptionContent(option.getOptionContent());
			optionVO.setSortOrder(option.getSortOrder());
			optionVOList.add(optionVO);
		}

		QuestionDetailVO questionDetailVO = new QuestionDetailVO();
		questionDetailVO.setId(question.getId());
		questionDetailVO.setTitle(question.getTitle());
		questionDetailVO.setContent(question.getContent());
		questionDetailVO.setCategory(question.getCategory());
		questionDetailVO.setDifficulty(question.getDifficulty());
		questionDetailVO.setQuestionType(question.getQuestionType());
		questionDetailVO.setCorrectOptionLabel(question.getCorrectOptionLabel());
		questionDetailVO.setAnalysis(question.getAnalysis());
		questionDetailVO.setOptions(optionVOList);
		return questionDetailVO;
	}

	/**
	 * 管理员查询题目列表，支持按分类、难度、类型筛选，返回完整题目信息（含答案和选项）。
	 */
	public List<QuestionDetailVO> listQuestions(String category, Integer difficulty, Integer questionType) {
		userService.checkIsAdmin();

		QueryWrapper<Question> queryWrapper = new QueryWrapper<>();

		if (category != null && !category.trim().isEmpty()) {
			queryWrapper.eq("category", category.trim());
		}
		if (difficulty != null) {
			queryWrapper.eq("difficulty", difficulty);
		}
		if (questionType != null) {
			queryWrapper.eq("question_type", questionType);
		}

		queryWrapper.orderByDesc("create_time");

		List<Question> questions = questionMapper.selectList(queryWrapper);
		List<QuestionDetailVO> result = new ArrayList<>();

		for (Question question : questions) {
			QueryWrapper<QuestionOption> optionWrapper = new QueryWrapper<>();
			optionWrapper.eq("question_id", question.getId());
			optionWrapper.orderByAsc("sort_order");

			List<QuestionOption> questionOptions = questionOptionMapper.selectList(optionWrapper);
			List<QuestionOptionVO> optionVOList = new ArrayList<>();
			for (QuestionOption option : questionOptions) {
				QuestionOptionVO optionVO = new QuestionOptionVO();
				optionVO.setOptionLabel(option.getOptionLabel());
				optionVO.setOptionContent(option.getOptionContent());
				optionVO.setSortOrder(option.getSortOrder());
				optionVOList.add(optionVO);
			}

			QuestionDetailVO vo = new QuestionDetailVO();
			vo.setId(question.getId());
			vo.setTitle(question.getTitle());
			vo.setContent(question.getContent());
			vo.setCategory(question.getCategory());
			vo.setDifficulty(question.getDifficulty());
			vo.setQuestionType(question.getQuestionType());
			vo.setCorrectOptionLabel(question.getCorrectOptionLabel());
			vo.setAnalysis(question.getAnalysis());
			vo.setOptions(optionVOList);

			result.add(vo);
		}

		return result;
	}

	/**
	 * 管理员修改题目与选项 (更新记录，双删题目多级缓存)
	 */
	@Transactional(rollbackFor = Exception.class)
	public void updateQuestion(AdminUpdateQuestionRequest request) {
		userService.checkIsAdmin();

		if (request == null || request.getId() == null || request.getId() <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数请求不合法");
		}
		Question exitsQuestion = questionMapper.selectById(request.getId());
		if (exitsQuestion == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}

		Question question = new Question();
		question.setId(request.getId());
		if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
			question.setTitle(request.getTitle().trim());
		}
		if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
			question.setContent(request.getContent().trim());
		}
		if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
			question.setCategory(request.getCategory().trim());
		}
		if (request.getDifficulty() != null) {
			question.setDifficulty(request.getDifficulty());
		}
		if (request.getQuestionType() != null) {
			question.setQuestionType(request.getQuestionType());
		}
		if (request.getCorrectOptionLabel() != null) {
			question.setCorrectOptionLabel(request.getCorrectOptionLabel().trim());
		}
		if (request.getAnalysis() != null) {
			question.setAnalysis(request.getAnalysis().trim());
		}
		if (request.getOptions() != null && !request.getOptions().isEmpty()) {
			if (request.getCorrectOptionLabel() == null || request.getCorrectOptionLabel().trim().isEmpty()) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案不能为空");
			}
			boolean hasCorrectOption = false;
			for (AdminAddOptionRequest optReq : request.getOptions()) {
				if (optReq.getOptionLabel() != null && request.getCorrectOptionLabel().trim().equals(optReq.getOptionLabel().trim())) {
					hasCorrectOption = true;
					break;
				}
			}
			if (!hasCorrectOption) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案必须存在于选项中");
			}
		}
		if (request.getStatus() != null) {
			question.setStatus(request.getStatus());
		}

		questionMapper.updateById(question);
 
		// 使用显式手写的物理删除 SQL，绕开 MyBatis-Plus 的全局逻辑删除逻辑，彻底规避联合唯一索引 Duplicate 冲突。
		questionOptionMapper.deletePhysicallyByQuestionId(request.getId());

		List<AdminAddOptionRequest> options = request.getOptions();
		if (options != null && !options.isEmpty()) {
			for (AdminAddOptionRequest optReq : options) {
				if (optReq.getOptionLabel() == null || optReq.getOptionContent() == null) {
					throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项标识与内容不能为空");
				}
				QuestionOption option = new QuestionOption();
				option.setQuestionId(request.getId());
				option.setOptionLabel(optReq.getOptionLabel().trim());
				option.setOptionContent(optReq.getOptionContent().trim());
				option.setSortOrder(optReq.getSortOrder() != null ? optReq.getSortOrder() : 0);

				questionOptionMapper.insert(option);
			}
		}

		String cacheKey = "question:detail:" + request.getId();
		caffeineCache.invalidate(cacheKey);
		stringRedisTemplate.delete(cacheKey);
	}
}
