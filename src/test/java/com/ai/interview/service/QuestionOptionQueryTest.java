package com.ai.interview.service;

import com.ai.interview.entity.QuestionOption;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class QuestionOptionQueryTest {

	@Test
	void listByQuestionIdsSkipsEmptyInput() {
		QuestionOptionMapper mapper = mock(QuestionOptionMapper.class);
		QuestionOptionQuery query = new QuestionOptionQuery(mapper);

		Map<Long, List<QuestionOption>> result = query.listByQuestionIds(List.of());

		assertEquals(Map.of(), result);
		verifyNoInteractions(mapper);
	}

	@Test
	@SuppressWarnings("unchecked")
	void listByQuestionIdsGroupsOptionsByQuestionId() {
		QuestionOptionMapper mapper = mock(QuestionOptionMapper.class);
		when(mapper.selectList(any(QueryWrapper.class))).thenReturn(List.of(
				option(1L, "A"),
				option(1L, "B"),
				option(2L, "A")
		));

		Map<Long, List<QuestionOption>> result = new QuestionOptionQuery(mapper).listByQuestionIds(List.of(1L, 2L));

		assertEquals(2, result.get(1L).size());
		assertEquals(1, result.get(2L).size());
	}

	private QuestionOption option(Long questionId, String label) {
		QuestionOption option = new QuestionOption();
		option.setQuestionId(questionId);
		option.setOptionLabel(label);
		return option;
	}
}
