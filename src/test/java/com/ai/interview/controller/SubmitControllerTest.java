package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.service.LearningAnalyticsService;
import com.ai.interview.service.SubmitQueryService;
import com.ai.interview.service.SubmitService;
import com.ai.interview.service.WrongBookService;
import com.ai.interview.vo.SubmitAnswerVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SubmitControllerTest {

	private final SubmitService submitService = mock(SubmitService.class);
	private final SubmitQueryService submitQueryService = mock(SubmitQueryService.class);
	private final WrongBookService wrongBookService = mock(WrongBookService.class);
	private final LearningAnalyticsService learningAnalyticsService = mock(LearningAnalyticsService.class);
	private final SubmitController controller = new SubmitController();

	SubmitControllerTest() {
		ReflectionTestUtils.setField(controller, "submitService", submitService);
		ReflectionTestUtils.setField(controller, "submitQueryService", submitQueryService);
		ReflectionTestUtils.setField(controller, "wrongBookService", wrongBookService);
		ReflectionTestUtils.setField(controller, "learningAnalyticsService", learningAnalyticsService);
	}

	@Test
	void submitAnswerWrapsServiceResult() {
		SubmitAnswerRequest request = new SubmitAnswerRequest();
		SubmitAnswerVO answerVO = new SubmitAnswerVO();
		answerVO.setSubmitId(1L);
		when(submitService.submitAnswer(request)).thenReturn(answerVO);

		BaseResponse<SubmitAnswerVO> response = controller.submitAnswer(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(answerVO, response.getData());
		verify(submitService).submitAnswer(request);
	}
}
