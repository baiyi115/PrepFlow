package com.ai.interview.service;

import com.ai.interview.entity.User;
import com.ai.interview.vo.LoginVO;
import com.ai.interview.vo.UserVO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserAssemblerTest {

	@Test
	void toUserVOMappingPublicUserFields() {
		UserVO vo = UserAssembler.toUserVO(user());

		assertEquals(1L, vo.getUserId());
		assertEquals("alice", vo.getUsername());
		assertEquals("Alice", vo.getNickname());
		assertEquals("/avatar.png", vo.getAvatarUrl());
		assertEquals(1, vo.getUserRole());
		assertEquals(0, vo.getStatus());
	}

	@Test
	void toLoginVOAddsTokenFields() {
		LoginVO vo = UserAssembler.toLoginVO(user(), "satoken", "token-value");

		assertEquals(1L, vo.getUserId());
		assertEquals("alice", vo.getUsername());
		assertEquals("satoken", vo.getTokenName());
		assertEquals("token-value", vo.getTokenValue());
	}

	private User user() {
		User user = new User();
		user.setId(1L);
		user.setUsername("alice");
		user.setNickname("Alice");
		user.setAvatarUrl("/avatar.png");
		user.setUserRole(1);
		user.setStatus(0);
		return user;
	}
}
