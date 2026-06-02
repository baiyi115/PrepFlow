package com.ai.interview.service;

import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class RateLimitService {

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	public boolean tryAcquire(Long userId, String businessKey, int windowSeconds, int maxRequests) {
		String key = "rate_limit:" + businessKey + ":" + userId;
		long currentTime = System.currentTimeMillis();
		long windowStart = currentTime - windowSeconds * 1000L;
		String number = UUID.randomUUID().toString();

		stringRedisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
		Long count = stringRedisTemplate.opsForZSet().zCard(key);
		if (count != null && count >= maxRequests) {
			return false;
		}

		stringRedisTemplate.opsForZSet().add(key, number, currentTime);
		stringRedisTemplate.expire(key, Duration.ofSeconds(windowSeconds));

		return true;
	}
}
