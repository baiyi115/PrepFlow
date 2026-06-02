package com.ai.interview.common;

import lombok.Data;

@Data
public class BaseResponse<T> {

	private Integer code;

	private String message;

	private T data;

	public BaseResponse(Integer code, String message, T data) {
		this.code = code;
		this.message = message;
		this.data = data;
	}

	public BaseResponse(ErrorCode errorCode, T data) {
		this.code = errorCode.getCode();
		this.message = errorCode.getMessage();
		this.data = data;
	}

	public BaseResponse(ErrorCode errorCode) {
		this(errorCode,null);
	}
}
