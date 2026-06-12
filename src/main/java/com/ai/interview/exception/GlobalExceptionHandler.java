package com.ai.interview.exception;

import cn.dev33.satoken.exception.NotLoginException;
import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.common.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public BaseResponse<?> handleBusinessException(BusinessException e) {
		return ResultUtils.error(e.getCode(), e.getMessage());
	}

	@ExceptionHandler(NotLoginException.class)
	public BaseResponse<?> notLoginExceptionHandler(NotLoginException e) {
		return ResultUtils.error(ErrorCode.NOT_LOGIN_ERROR);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public BaseResponse<?> validationExceptionHandler(MethodArgumentNotValidException e) {
		FieldError fieldError = e.getBindingResult().getFieldError();
		String message = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
		return ResultUtils.error(ErrorCode.PARAMS_ERROR.getCode(), message);
	}

	@ExceptionHandler(org.springframework.dao.DuplicateKeyException.class)
	public BaseResponse<?> duplicateKeyExceptionHandler(org.springframework.dao.DuplicateKeyException e) {
		log.error("DuplicateKeyException", e);
		return ResultUtils.error(ErrorCode.DUPLICATE_SUBMIT_ERROR);
	}

	@ExceptionHandler(RuntimeException.class)
	public BaseResponse<?> runtimeExceptionHandle(RuntimeException e) {
		log.error("RuntimeException", e);
		return ResultUtils.error(ErrorCode.SYSTEM_ERROR);
	}
}
