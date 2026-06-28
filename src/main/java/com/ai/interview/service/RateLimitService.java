package com.ai.interview.service;

import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基于内存的滑动窗口限流服务。
 */
@Service
public class RateLimitService {

	private static final int MAX_TRACKED_KEYS = 10000;

	private final Map<String, Deque<Long>> requestTimeMap = new ConcurrentHashMap<>();

	public boolean tryAcquire(Long userId, String businessKey, int windowSeconds, int maxRequests) {
		if (userId == null || businessKey == null || businessKey.isBlank() || windowSeconds <= 0 || maxRequests <= 0) {
			return false;
		}

		long currentTime = System.currentTimeMillis();
		long windowMillis = windowSeconds * 1000L;
		Deque<Long> requestTimes = requestTimeMap.computeIfAbsent(limitKey(userId, businessKey), key -> new ArrayDeque<>());

		synchronized (requestTimes) {
			removeExpiredRequests(requestTimes, currentTime, windowMillis);
			if (requestTimes.size() >= maxRequests) {
				return false;
			}
			requestTimes.addLast(currentTime);
		}

		cleanupExpiredKeys(currentTime, windowMillis);
		return true;
	}

	private String limitKey(Long userId, String businessKey) {
		return "rate_limit:" + businessKey + ":" + userId;
	}

	private void removeExpiredRequests(Deque<Long> requestTimes, long currentTime, long windowMillis) {
		while (!requestTimes.isEmpty() && currentTime - requestTimes.peekFirst() >= windowMillis) {
			requestTimes.removeFirst();
		}
	}

	private void cleanupExpiredKeys(long currentTime, long windowMillis) {
		if (requestTimeMap.size() <= MAX_TRACKED_KEYS) {
			return;
		}
		requestTimeMap.entrySet().removeIf(entry -> isExpiredBucket(entry.getValue(), currentTime, windowMillis));
	}

	private boolean isExpiredBucket(Deque<Long> requestTimes, long currentTime, long windowMillis) {
		synchronized (requestTimes) {
			removeExpiredRequests(requestTimes, currentTime, windowMillis);
			return requestTimes.isEmpty();
		}
	}
}
