package com.ai.interview.service;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.entity.Question;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionVO;
import com.ai.interview.constant.BusinessConstant;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuestionService {

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionQuery questionOptionQuery;

	@Resource
	private Cache<String, Object> caffeineCache;

	public QuestionDetailVO getQuestionDetail(Long questionId) {
		if (questionId == null || questionId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}

		String cacheKey = "question:detail:" + questionId;

		// 使用本地 Caffeine 缓存题目详情，避免重复查询题目和选项。
		QuestionDetailVO l1Cache = (QuestionDetailVO) caffeineCache.getIfPresent(cacheKey);
		if (l1Cache != null){
			return l1Cache;
		}

		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}
		if (!Integer.valueOf(BusinessConstant.QUESTION_STATUS_ENABLED).equals(question.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "题目已禁用");
		}
		QuestionDetailVO questionDetailVO = QuestionAssembler.toDetailVO(
				question,
				questionOptionQuery.listByQuestionId(questionId),
				false
		);

		caffeineCache.put(cacheKey, questionDetailVO);

		return questionDetailVO;
	}

	public Map<Long, Question> getQuestionMap(Collection<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return Map.of();
		}
		List<Question> questions = questionMapper.selectBatchIds(ids);
		return questions.stream().collect(Collectors.toMap(Question::getId, q -> q));
	}

	public List<QuestionVO> listQuestions() {
		QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("status", BusinessConstant.QUESTION_STATUS_ENABLED);
		List<Question> questionList = questionMapper.selectList(queryWrapper);
		return questionList.stream()
				.map(QuestionAssembler::toQuestionVO)
				.toList();
	}
}
