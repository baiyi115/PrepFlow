package com.ai.interview.common;

public enum ErrorCode {

	SUCCESS(0, "ok"),

	PARAMS_ERROR(40000, "参数错误"),

	NULL_ERROR(40001, "请求数据为空"),

	NOT_FOUND_ERROR(40400, "数据不存在"),

	FORBIDDEN_ERROR(40300, "禁止访问"),

	NOT_LOGIN_ERROR(40100, "用户未登录"),

	DUPLICATE_SUBMIT_ERROR(40900, "请勿重复提交"),

	RATE_LIMIT_ERROR(42900, "请求过于频繁，请稍后再试"),

	SYSTEM_ERROR(50000, "系统内部异常");

	private final Integer code;

	public Integer getCode() {
		return code;
	}

	private final String message;

	public String getMessage() {
		return message;
	}

	ErrorCode(Integer code, String message) {
		this.code = code;
		this.message = message;
	}

}
