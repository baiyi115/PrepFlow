package com.ai.interview.exception;

import com.ai.interview.common.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

	private final Integer code;

	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.code = errorCode.getCode();
	}

	public BusinessException(ErrorCode errorCode, String message) {
		super(message);
		this.code = errorCode.getCode();
	}

}
