package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.LoginRequest;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.exception.BusinessException;

final class UserValidator {

	private UserValidator() {
	}

	static void validateLogin(LoginRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (isBlank(request.getUsername())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名为空");
		}
		if (isBlank(request.getPassword())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码为空");
		}
	}

	static void validateRegister(RegisterRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (isBlank(request.getUsername())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名不能为空");
		}
		if (isBlank(request.getPassword())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码不能为空");
		}
		if (isBlank(request.getNickname())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "昵称不能为空");
		}
	}

	static void validateUpdateProfile(UpdateProfileRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
	}

	static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
