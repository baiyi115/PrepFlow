package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.LoginRequest;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.entity.User;
import com.ai.interview.exception.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UserHelperTest {

	@Test
	void validateLoginRejectsBlankUsername() {
		LoginRequest request = new LoginRequest();
		request.setUsername(" ");
		request.setPassword("123456");

		assertThrows(BusinessException.class, () -> UserValidator.validateLogin(request));
	}

	@Test
	void validateRegisterRejectsBlankNickname() {
		RegisterRequest request = new RegisterRequest();
		request.setUsername("alice");
		request.setPassword("123456");
		request.setNickname(" ");

		assertThrows(BusinessException.class, () -> UserValidator.validateRegister(request));
	}

	@Test
	void toNewUserTrimsRegisterFieldsAndSetsDefaults() {
		RegisterRequest request = new RegisterRequest();
		request.setUsername(" alice ");
		request.setNickname(" Alice ");

		User user = UserAssembler.toNewUser(request, "hash");

		assertEquals("alice", user.getUsername());
		assertEquals("Alice", user.getNickname());
		assertEquals("hash", user.getPasswordHash());
		assertEquals(BusinessConstant.USER_STATUS_NORMAL, user.getStatus());
	}

	@Test
	void toProfileUpdateKeepsOnlyNonBlankFields() {
		UpdateProfileRequest request = new UpdateProfileRequest();
		request.setNickname(" Bob ");
		request.setAvatarUrl(" ");

		User user = UserAssembler.toProfileUpdate(10L, request);

		assertEquals(10L, user.getId());
		assertEquals("Bob", user.getNickname());
		assertEquals(null, user.getAvatarUrl());
	}
}
