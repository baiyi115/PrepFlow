package com.ai.interview.exception;

import cn.dev33.satoken.exception.NotLoginException;
import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class GlobalExceptionHandlerTest {

	private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

	@Test
	void businessExceptionKeepsBusinessCodeAndMessage() {
		BaseResponse<?> response = handler.handleBusinessException(
				new BusinessException(ErrorCode.PARAMS_ERROR, "参数不合法")
		);

		assertEquals(ErrorCode.PARAMS_ERROR.getCode(), response.getCode());
		assertEquals("参数不合法", response.getMessage());
		assertNull(response.getData());
	}

	@Test
	void notLoginExceptionMapsToNotLoginError() {
		BaseResponse<?> response = handler.notLoginExceptionHandler(
				new NotLoginException("未登录", "login", NotLoginException.NOT_TOKEN)
		);

		assertEquals(ErrorCode.NOT_LOGIN_ERROR.getCode(), response.getCode());
		assertEquals(ErrorCode.NOT_LOGIN_ERROR.getMessage(), response.getMessage());
		assertNull(response.getData());
	}

	@Test
	void validationExceptionUsesFirstFieldErrorMessage() {
		BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
		bindingResult.addError(new FieldError("request", "username", "用户名不能为空"));

		BaseResponse<?> response = handler.validationExceptionHandler(
				new MethodArgumentNotValidException(null, bindingResult)
		);

		assertEquals(ErrorCode.PARAMS_ERROR.getCode(), response.getCode());
		assertEquals("用户名不能为空", response.getMessage());
		assertNull(response.getData());
	}
}
