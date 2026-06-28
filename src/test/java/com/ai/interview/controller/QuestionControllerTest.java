package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.service.QuestionService;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class QuestionControllerTest {

	private final QuestionService questionService = mock(QuestionService.class);
	private final QuestionController controller = new QuestionController();

	QuestionControllerTest() {
		ReflectionTestUtils.setField(controller, "questionService", questionService);
	}

	@Test
	void getQuestionDetailWrapsServiceResult() {
		QuestionDetailVO detail = new QuestionDetailVO();
		detail.setId(1L);
		when(questionService.getQuestionDetail(1L)).thenReturn(detail);

		BaseResponse<QuestionDetailVO> response = controller.getQuestionDetail(1L);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(detail, response.getData());
		verify(questionService).getQuestionDetail(1L);
	}

	@Test
	void listQuestionsWrapsServiceResult() {
		QuestionVO question = new QuestionVO();
		question.setId(1L);
		when(questionService.listQuestions()).thenReturn(List.of(question));

		BaseResponse<List<QuestionVO>> response = controller.listQuestions();

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(List.of(question), response.getData());
		verify(questionService).listQuestions();
	}
}
