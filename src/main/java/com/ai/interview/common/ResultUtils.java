package com.ai.interview.common;

public class ResultUtils {

	private ResultUtils() {
	}

	public static <T> BaseResponse<T> success(T data) {
		return new BaseResponse<>(ErrorCode.SUCCESS, data);
	}

	public static BaseResponse<?> error(ErrorCode errorCode) {
		return new BaseResponse<>(errorCode);
	}

	public static BaseResponse<?> error(Integer code, String message) {
		return new BaseResponse<>(code, message, null);
	}
}
