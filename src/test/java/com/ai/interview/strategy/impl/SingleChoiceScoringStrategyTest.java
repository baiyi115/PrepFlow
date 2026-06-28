package com.ai.interview.strategy.impl;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SingleChoiceScoringStrategyTest {

	private final SingleChoiceScoringStrategy strategy = new SingleChoiceScoringStrategy();

	@Test
	void doScoreMarksCorrectAnswerAndFullScore() {
		UserSubmit submit = submit(" A ");

		UserSubmit result = strategy.doScore(question("A"), submit);

		assertSame(submit, result);
		assertEquals(BusinessConstant.ANSWER_CORRECT, result.getIsCorrect());
		assertEquals(new BigDecimal("100.00"), result.getScore());
	}

	@Test
	void doScoreMarksWrongAnswerAndZeroScore() {
		UserSubmit result = strategy.doScore(question("A"), submit("B"));

		assertEquals(BusinessConstant.ANSWER_WRONG, result.getIsCorrect());
		assertEquals(new BigDecimal("0.00"), result.getScore());
	}

	@Test
	void doScoreRejectsQuestionWithoutCorrectAnswer() {
		assertThrows(BusinessException.class, () -> strategy.doScore(question(" "), submit("A")));
	}

	@Test
	void doScoreRejectsMissingSelectedOption() {
		assertThrows(BusinessException.class, () -> strategy.doScore(question("A"), submit(null)));
	}

	@Test
	void getQuestionTypeReturnsSingleChoiceType() {
		assertEquals(BusinessConstant.QUESTION_TYPE_SINGLE_CHOICE, strategy.getQuestionType());
	}

	private Question question(String correctOptionLabel) {
		Question question = new Question();
		question.setCorrectOptionLabel(correctOptionLabel);
		return question;
	}

	private UserSubmit submit(String selectedOptionLabel) {
		UserSubmit submit = new UserSubmit();
		submit.setSelectedOptionLabel(selectedOptionLabel);
		return submit;
	}
}
