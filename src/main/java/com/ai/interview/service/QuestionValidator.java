package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.exception.BusinessException;

import java.util.List;

final class QuestionValidator {

	private QuestionValidator() {
	}

	static void validateAddQuestion(AdminAddQuestionRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求参数为空");
		}
		if (isBlank(request.getTitle())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目标题不能为空");
		}
		if (isBlank(request.getContent())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目内容不能为空");
		}
		if (isBlank(request.getCategory())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目分类不能为空");
		}
		if (request.getDifficulty() == null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目难度不能为空");
		}
		if (request.getQuestionType() == null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目类型不能为空");
		}
		if (isBlank(request.getCorrectOptionLabel())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案不能为空");
		}
		validateOptions(request.getOptions(), request.getCorrectOptionLabel());
	}

	static void validateUpdateQuestion(AdminUpdateQuestionRequest request) {
		if (request == null || request.getId() == null || request.getId() <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数请求不合法");
		}
		if (request.getOptions() != null && !request.getOptions().isEmpty()) {
			if (isBlank(request.getCorrectOptionLabel())) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案不能为空");
			}
			validateOptions(request.getOptions(), request.getCorrectOptionLabel());
		}
	}

	static void validateQuestionId(Long questionId) {
		if (questionId == null || questionId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}
	}

	private static void validateOptions(List<AdminAddOptionRequest> options, String correctOptionLabel) {
		if (options == null || options.isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项不能为空");
		}
		boolean hasCorrectOption = false;
		for (AdminAddOptionRequest option : options) {
			if (isBlank(option.getOptionLabel())) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项标识不能为空");
			}
			if (isBlank(option.getOptionContent())) {
				throw new BusinessException(ErrorCode.PARAMS_ERROR, "选项内容不能为空");
			}
			if (correctOptionLabel.trim().equals(option.getOptionLabel().trim())) {
				hasCorrectOption = true;
			}
		}
		if (!hasCorrectOption) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "正确答案必须存在于选项中");
		}
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
