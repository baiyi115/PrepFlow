package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.LoginRequest;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.service.LearningAnalyticsService;
import com.ai.interview.service.UserService;
import com.ai.interview.vo.LoginVO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserControllerTest {

	private final UserService userService = mock(UserService.class);
	private final LearningAnalyticsService learningAnalyticsService = mock(LearningAnalyticsService.class);
	private final UserController controller = new UserController();

	UserControllerTest() {
		ReflectionTestUtils.setField(controller, "userService", userService);
		ReflectionTestUtils.setField(controller, "learningAnalyticsService", learningAnalyticsService);
	}

	@Test
	void loginWrapsServiceResult() {
		LoginRequest request = new LoginRequest();
		LoginVO loginVO = new LoginVO();
		loginVO.setUsername("alice");
		when(userService.login(request)).thenReturn(loginVO);

		BaseResponse<LoginVO> response = controller.login(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(loginVO, response.getData());
		verify(userService).login(request);
	}

	@Test
	void registerWrapsCreatedUserId() {
		RegisterRequest request = new RegisterRequest();
		when(userService.register(request)).thenReturn(10L);

		BaseResponse<Long> response = controller.register(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(10L, response.getData());
		verify(userService).register(request);
	}

	@Test
	void updateProfileReturnsTrueAfterServiceUpdate() {
		UpdateProfileRequest request = new UpdateProfileRequest();

		BaseResponse<Boolean> response = controller.updateProfile(request);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(true, response.getData());
		verify(userService).updateProfile(request);
	}

	@Test
	void uploadAvatarWrapsAvatarUrl() {
		MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", new byte[]{1});
		when(userService.uploadAvatar(file)).thenReturn("/api/uploads/avatar.png");

		BaseResponse<String> response = controller.uploadAvatar(file);

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals("/api/uploads/avatar.png", response.getData());
		verify(userService).uploadAvatar(file);
	}

	@Test
	void logoutReturnsTrueAfterServiceLogout() {
		BaseResponse<Boolean> response = controller.logout();

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(true, response.getData());
		verify(userService).logout();
	}
}
