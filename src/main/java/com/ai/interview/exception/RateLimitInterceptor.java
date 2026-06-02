package com.ai.interview.exception;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.common.RateLimit;
import com.ai.interview.exception.BusinessException;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		if (!(handler instanceof HandlerMethod)) {
			return true;
		}

		HandlerMethod handlerMethod = (HandlerMethod) handler;
		RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

		// 如果方法上没有加 @RateLimit 注解，直接放行
		if (rateLimit == null) {
			return true;
		}

		// 获取当前登录用户 ID，限流必须针对具体用户，否则会误伤别人
		// 如果未登录，StpUtil 会自动抛出 NotLoginException，由全局异常处理器拦截
		Long userId = StpUtil.getLoginIdAsLong();

		String keyPrefix = rateLimit.key();
		int limit = rateLimit.limit();
		int period = rateLimit.period();

		String redisKey = "limit:" + keyPrefix + ":" + userId;
		long currentTime = System.currentTimeMillis();
		long windowStart = currentTime - (period * 1000L);

		// 精确清理窗口外的旧请求
		stringRedisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStart);

		// 统计当前窗口内剩余的请求总数
		Long count = stringRedisTemplate.opsForZSet().zCard(redisKey);

		// 判断是否超过限制
		if (count != null && count >= limit) {
			throw new BusinessException(ErrorCode.RATE_LIMIT_ERROR);
		}

		// 记录当前请求并设置过期时间防止死 key
		stringRedisTemplate.opsForZSet().add(redisKey, String.valueOf(currentTime), currentTime);
		stringRedisTemplate.expire(redisKey, Duration.ofSeconds(period));

		return true;
	}
}
