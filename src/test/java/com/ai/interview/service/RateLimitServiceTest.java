package com.ai.interview.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimitServiceTest {

	private final RateLimitService rateLimitService = new RateLimitService();

	@Test
	void tryAcquireRejectsInvalidArguments() {
		assertFalse(rateLimitService.tryAcquire(null, "submit", 60, 5));
		assertFalse(rateLimitService.tryAcquire(1L, " ", 60, 5));
		assertFalse(rateLimitService.tryAcquire(1L, "submit", 0, 5));
		assertFalse(rateLimitService.tryAcquire(1L, "submit", 60, 0));
	}

	@Test
	void tryAcquireAllowsBurstUntilWindowLimit() {
		for (int i = 0; i < 5; i++) {
			assertTrue(rateLimitService.tryAcquire(1L, "submit", 60, 5));
		}

		assertFalse(rateLimitService.tryAcquire(1L, "submit", 60, 5));
	}

	@Test
	void tryAcquireUsesBusinessKeyAsSeparateBucket() {
		assertTrue(rateLimitService.tryAcquire(1L, "submit", 60, 5));

		assertTrue(rateLimitService.tryAcquire(1L, "ai", 60, 5));
	}

	@Test
	void tryAcquireUsesUserIdAsSeparateBucket() {
		for (int i = 0; i < 5; i++) {
			assertTrue(rateLimitService.tryAcquire(1L, "submit", 60, 5));
		}

		assertTrue(rateLimitService.tryAcquire(2L, "submit", 60, 5));
	}
}
