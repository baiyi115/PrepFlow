package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminQuestionService {

	private static final String QUESTION_DETAIL_CACHE_KEY_PREFIX = "question:detail:";

	@Resource
	private UserService userService;

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionMapper questionOptionMapper;

	@Resource
	private QuestionOptionQuery questionOptionQuery;

	@Resource
	private Cache<String, Object> caffeineCache;

	@Transactional(rollbackFor = Exception.class)
	public Long addQuestion(AdminAddQuestionRequest request) {
		userService.checkIsAdmin();
		QuestionValidator.validateAddQuestion(request);

		Question question = QuestionAssembler.toNewQuestion(request);
		int result = questionMapper.insert(question);
		if (result != 1) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "新增题目失败");
		}

		insertOptions(question.getId(), request.getOptions());
		return question.getId();
	}

	@Transactional(rollbackFor = Exception.class)
	public void deleteQuestion(Long questionId) {
		userService.checkIsAdmin();
		QuestionValidator.validateQuestionId(questionId);

		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
		}

		questionMapper.deleteById(questionId);
		questionOptionMapper.deletePhysicallyByQuestionId(questionId);
		invalidateQuestionDetailCache(questionId);
	}

	public QuestionDetailVO getQuestionDetail(Long questionId) {
		userService.checkIsAdmin();
		QuestionValidator.validateQuestionId(questionId);

		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}

		return QuestionAssembler.toDetailVO(question, questionOptionQuery.listByQuestionId(questionId), true);
	}

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
		if (questions.isEmpty()) {
			return List.of();
		}

		List<Long> questionIds = questions.stream().map(Question::getId).toList();
		Map<Long, List<QuestionOption>> optionsByQuestionId = questionOptionQuery.listByQuestionIds(questionIds);

		return questions.stream()
				.map(question -> QuestionAssembler.toDetailVO(
						question,
						optionsByQuestionId.getOrDefault(question.getId(), List.of()),
						true
				))
				.toList();
	}

	@Transactional(rollbackFor = Exception.class)
	public void updateQuestion(AdminUpdateQuestionRequest request) {
		userService.checkIsAdmin();
		QuestionValidator.validateUpdateQuestion(request);

		Question exitsQuestion = questionMapper.selectById(request.getId());
		if (exitsQuestion == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}

		questionMapper.updateById(QuestionAssembler.toUpdateQuestion(request));
		questionOptionMapper.deletePhysicallyByQuestionId(request.getId());

		List<AdminAddOptionRequest> options = request.getOptions();
		if (options != null && !options.isEmpty()) {
			insertOptions(request.getId(), options);
		}

		invalidateQuestionDetailCache(request.getId());
	}

	private void insertOptions(Long questionId, List<AdminAddOptionRequest> options) {
		for (AdminAddOptionRequest optionRequest : options) {
			QuestionOption option = QuestionAssembler.toOptionEntity(questionId, optionRequest);
			int optResult = questionOptionMapper.insert(option);
			if (optResult != 1) {
				throw new BusinessException(ErrorCode.SYSTEM_ERROR, "插入选项失败");
			}
		}
	}

	private void invalidateQuestionDetailCache(Long questionId) {
		caffeineCache.invalidate(QUESTION_DETAIL_CACHE_KEY_PREFIX + questionId);
	}
}
