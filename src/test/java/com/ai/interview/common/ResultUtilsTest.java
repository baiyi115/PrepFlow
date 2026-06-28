package com.ai.interview.common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ResultUtilsTest {

	@Test
	void successWrapsDataWithSuccessCode() {
		BaseResponse<String> response = ResultUtils.success("ok");

		assertEquals(ErrorCode.SUCCESS.getCode(), response.getCode());
		assertEquals(ErrorCode.SUCCESS.getMessage(), response.getMessage());
		assertEquals("ok", response.getData());
	}

	@Test
	void errorWrapsErrorCodeWithoutData() {
		BaseResponse<?> response = ResultUtils.error(ErrorCode.PARAMS_ERROR);

		assertEquals(ErrorCode.PARAMS_ERROR.getCode(), response.getCode());
		assertEquals(ErrorCode.PARAMS_ERROR.getMessage(), response.getMessage());
		assertNull(response.getData());
	}

	@Test
	void errorSupportsCustomMessage() {
		BaseResponse<?> response = ResultUtils.error(49999, "自定义错误");

		assertEquals(49999, response.getCode());
		assertEquals("自定义错误", response.getMessage());
		assertNull(response.getData());
	}
}
