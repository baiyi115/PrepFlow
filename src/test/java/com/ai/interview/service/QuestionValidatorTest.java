package com.ai.interview.service;

import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class QuestionValidatorTest {

	@Test
	void validateAddQuestionRejectsMissingCorrectOption() {
		AdminAddQuestionRequest request = validAddRequest();
		request.setCorrectOptionLabel("C");

		assertThrows(BusinessException.class, () -> QuestionValidator.validateAddQuestion(request));
	}

	@Test
	void validateAddQuestionAcceptsCompleteSingleChoiceQuestion() {
		assertDoesNotThrow(() -> QuestionValidator.validateAddQuestion(validAddRequest()));
	}

	@Test
	void validateUpdateQuestionRejectsOptionsWithoutCorrectAnswer() {
		AdminUpdateQuestionRequest request = new AdminUpdateQuestionRequest();
		request.setId(1L);
		request.setOptions(validOptions());

		assertThrows(BusinessException.class, () -> QuestionValidator.validateUpdateQuestion(request));
	}

	private AdminAddQuestionRequest validAddRequest() {
		AdminAddQuestionRequest request = new AdminAddQuestionRequest();
		request.setTitle(" Java 基础题 ");
		request.setContent(" 下列说法正确的是？ ");
		request.setCategory(" Java ");
		request.setDifficulty(1);
		request.setQuestionType(1);
		request.setCorrectOptionLabel("A");
		request.setAnalysis("解析");
		request.setOptions(validOptions());
		return request;
	}

	private List<AdminAddOptionRequest> validOptions() {
		AdminAddOptionRequest optionA = new AdminAddOptionRequest();
		optionA.setOptionLabel("A");
		optionA.setOptionContent("正确选项");
		optionA.setSortOrder(1);

		AdminAddOptionRequest optionB = new AdminAddOptionRequest();
		optionB.setOptionLabel("B");
		optionB.setOptionContent("错误选项");
		optionB.setSortOrder(2);

		return List.of(optionA, optionB);
	}
}
