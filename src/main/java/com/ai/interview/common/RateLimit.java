package com.ai.interview.common;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

	/**
	 * 限流 key 的前缀，用于区分不同接口
	 */
	String key() default "";

	/**
	 * 时间窗口内的限制次数，默认 5 次
	 */
	int limit() default 5;

	/**
	 * 时间窗口大小（单位：秒），默认 60 秒
	 */
	int period() default 60;
}
