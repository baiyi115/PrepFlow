package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ResultUtils;
import com.ai.interview.dto.LoginRequest;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.service.LearningAnalyticsService;
import com.ai.interview.service.UserService;
import com.ai.interview.vo.LoginVO;
import com.ai.interview.vo.UserProfileVO;
import com.ai.interview.vo.UserVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class UserController {

	@Resource
	private UserService userService;

	@Resource
	private LearningAnalyticsService learningAnalyticsService;

	@PostMapping("/api/users/login")
	public BaseResponse<LoginVO> login(@RequestBody LoginRequest request) {
		return ResultUtils.success(userService.login(request));
	}

	@PostMapping("/api/users/register")
	public BaseResponse<Long> register(@RequestBody RegisterRequest request) {
		return ResultUtils.success(userService.register(request));
	}

	@GetMapping("/api/users/me")
	public BaseResponse<UserVO> getLoginUser() {
		return ResultUtils.success(userService.getLoginUser());
	}

	@PutMapping("/api/users/me")
	public BaseResponse<Boolean> updateProfile(@RequestBody UpdateProfileRequest request) {
		userService.updateProfile(request);
		return ResultUtils.success(true);
	}

	@PostMapping("/api/users/me/avatar")
	public BaseResponse<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
		return ResultUtils.success(userService.uploadAvatar(file));
	}

	@GetMapping("/api/users/me/profile")
	public BaseResponse<UserProfileVO> getUserProfile() {
		return ResultUtils.success(learningAnalyticsService.getUserProfile());
	}

	@PostMapping("/api/users/logout")
	public BaseResponse<Boolean> logout() {
		userService.logout();
		return ResultUtils.success(true);
	}
}
