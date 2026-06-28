package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.entity.User;
import com.ai.interview.vo.LoginVO;
import com.ai.interview.vo.UserVO;

final class UserAssembler {

	private UserAssembler() {
	}

	static UserVO toUserVO(User user) {
		UserVO userVO = new UserVO();
		userVO.setUserId(user.getId());
		userVO.setUsername(user.getUsername());
		userVO.setNickname(user.getNickname());
		userVO.setAvatarUrl(user.getAvatarUrl());
		userVO.setUserRole(user.getUserRole());
		userVO.setStatus(user.getStatus());
		return userVO;
	}

	static LoginVO toLoginVO(User user, String tokenName, String tokenValue) {
		LoginVO loginVO = new LoginVO();
		loginVO.setUserId(user.getId());
		loginVO.setUsername(user.getUsername());
		loginVO.setNickname(user.getNickname());
		loginVO.setAvatarUrl(user.getAvatarUrl());
		loginVO.setUserRole(user.getUserRole());
		loginVO.setStatus(user.getStatus());
		loginVO.setTokenName(tokenName);
		loginVO.setTokenValue(tokenValue);
		return loginVO;
	}

	static User toNewUser(RegisterRequest request, String passwordHash) {
		User user = new User();
		user.setUsername(request.getUsername().trim());
		user.setPasswordHash(passwordHash);
		user.setNickname(request.getNickname().trim());
		user.setStatus(BusinessConstant.USER_STATUS_NORMAL);
		return user;
	}

	static User toProfileUpdate(Long userId, UpdateProfileRequest request) {
		User user = new User();
		user.setId(userId);
		if (!UserValidator.isBlank(request.getNickname())) {
			user.setNickname(request.getNickname().trim());
		}
		if (!UserValidator.isBlank(request.getAvatarUrl())) {
			user.setAvatarUrl(request.getAvatarUrl().trim());
		}
		return user;
	}

	static User toAvatarUpdate(Long userId, String avatarUrl) {
		User user = new User();
		user.setId(userId);
		user.setAvatarUrl(avatarUrl);
		return user;
	}
}
