package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateUserStatusRequest;
import com.ai.interview.service.AdminQuestionService;
import com.ai.interview.service.AdminUserService;
import com.ai.interview.vo.UserVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminControllerTest {

	private final AdminQuestionService adminQuestionService = mock(AdminQuestionService.class);
	private final AdminUserService adminUserService = mock(AdminUserService.class);
	private final AdminController controller = new AdminController();

	AdminControllerTest() {
		ReflectionTestUtils.setField(controller, "adminQuestionService", adminQuestionService);
		ReflectionTestUtils.setField(controller, "adminUserService", adminUserService);
	}

	@Test
	void addQuestionWrapsCreatedQuestionId() {
		AdminAddQuestionRequest request = new AdminAddQuestionRequest();
		when(adminQuestionService.addQuestion(request)).thenReturn(10L);

		BaseResponse<Long> response = controller.addQuestion(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(10L, response.getData());
		verify(adminQuestionService).addQuestion(request);
	}

	@Test
	void listUsersWrapsServiceResult() {
		UserVO userVO = new UserVO();
		userVO.setUserId(1L);
		when(adminUserService.listUsers()).thenReturn(List.of(userVO));

		BaseResponse<List<UserVO>> response = controller.listUsers();

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(List.of(userVO), response.getData());
		verify(adminUserService).listUsers();
	}

	@Test
	void updateUserStatusReturnsTrueAfterServiceUpdate() {
		AdminUpdateUserStatusRequest request = new AdminUpdateUserStatusRequest();

		BaseResponse<Boolean> response = controller.updateUserStatus(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(true, response.getData());
		verify(adminUserService).updateUserStatus(request);
	}
}
