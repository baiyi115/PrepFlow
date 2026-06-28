package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.exception.BusinessException;

final class SubmitValidator {

	private SubmitValidator() {
	}

	static void validateSubmitRequest(SubmitAnswerRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (request.getQuestionId() == null || request.getQuestionId() <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}
		if (isBlank(request.getSelectedOptionLabel())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "请选择答案");
		}
		if (isBlank(request.getSubmitToken())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "提交令牌不合法");
		}
	}

	static void validateEnabledQuestion(Question question) {
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}
		if (!Integer.valueOf(BusinessConstant.QUESTION_STATUS_ENABLED).equals(question.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "题目已禁用");
		}
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
