package com.ai.interview.service;

import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
public class RateLimitService {

	private static final DefaultRedisScript<Long> SLIDING_WINDOW_SCRIPT = new DefaultRedisScript<>(
			"""
			redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
			local count = redis.call('ZCARD', KEYS[1])
			if count >= tonumber(ARGV[4]) then
				redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))
				return 0
			end
			redis.call('ZADD', KEYS[1], ARGV[2], ARGV[3])
			redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))
			return 1
			""",
			Long.class
	);

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	public boolean tryAcquire(Long userId, String businessKey, int windowSeconds, int maxRequests) {
		if (userId == null || businessKey == null || businessKey.isBlank() || windowSeconds <= 0 || maxRequests <= 0) {
			return false;
		}

		String key = "rate_limit:" + businessKey + ":" + userId;
		long currentTime = System.currentTimeMillis();
		long windowStart = currentTime - windowSeconds * 1000L;
		String member = currentTime + ":" + UUID.randomUUID();

		Long allowed = stringRedisTemplate.execute(
				SLIDING_WINDOW_SCRIPT,
				Collections.singletonList(key),
				String.valueOf(windowStart),
				String.valueOf(currentTime),
				member,
				String.valueOf(maxRequests),
				String.valueOf(windowSeconds)
		);
		return Long.valueOf(1L).equals(allowed);
	}
}
