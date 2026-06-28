package com.ai.interview.service;

import com.ai.interview.entity.QuestionOption;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
class QuestionOptionQuery {

	private final QuestionOptionMapper questionOptionMapper;

	QuestionOptionQuery(QuestionOptionMapper questionOptionMapper) {
		this.questionOptionMapper = questionOptionMapper;
	}

	List<QuestionOption> listByQuestionId(Long questionId) {
		QueryWrapper<QuestionOption> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("question_id", questionId);
		queryWrapper.orderByAsc("sort_order");
		return questionOptionMapper.selectList(queryWrapper);
	}

	Map<Long, List<QuestionOption>> listByQuestionIds(Collection<Long> questionIds) {
		if (questionIds == null || questionIds.isEmpty()) {
			return Map.of();
		}
		QueryWrapper<QuestionOption> queryWrapper = new QueryWrapper<>();
		queryWrapper.in("question_id", questionIds.stream().distinct().toList());
		queryWrapper.orderByAsc("question_id");
		queryWrapper.orderByAsc("sort_order");
		return questionOptionMapper.selectList(queryWrapper).stream()
				.collect(Collectors.groupingBy(QuestionOption::getQuestionId));
	}
}
