package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.vo.SubmitAnswerVO;
import com.ai.interview.vo.UserSubmitVO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SubmitHelperTest {

	@Test
	void validateRequestRejectsBlankSelectedOption() {
		SubmitAnswerRequest request = validRequest();
		request.setSelectedOptionLabel(" ");

		assertThrows(BusinessException.class, () -> SubmitValidator.validateSubmitRequest(request));
	}

	@Test
	void validateQuestionRejectsDisabledQuestion() {
		Question question = question();
		question.setStatus(0);

		assertThrows(BusinessException.class, () -> SubmitValidator.validateEnabledQuestion(question));
	}

	@Test
	void toNewSubmitTrimsRequestFieldsAndSnapshotsAnswer() {
		SubmitAnswerRequest request = validRequest();
		UserSubmit submit = SubmitAssembler.toNewSubmit(9L, request, question());

		assertEquals(9L, submit.getUserId());
		assertEquals(1L, submit.getQuestionId());
		assertEquals("B", submit.getSelectedOptionLabel());
		assertEquals("A", submit.getCorrectOptionLabel());
		assertEquals(BusinessConstant.SUBMIT_STATUS_FINISHED, submit.getSubmitStatus());
		assertEquals("token-1", submit.getSubmitToken());
	}

	@Test
	void toSubmitAnswerVOMappingResultFields() {
		UserSubmit submit = SubmitAssembler.toNewSubmit(9L, validRequest(), question());
		submit.setId(100L);
		submit.setIsCorrect(BusinessConstant.ANSWER_WRONG);
		submit.setScore(BigDecimal.ZERO);

		SubmitAnswerVO vo = SubmitAssembler.toSubmitAnswerVO(submit, question());

		assertEquals(100L, vo.getSubmitId());
		assertEquals(1L, vo.getQuestionId());
		assertEquals(BusinessConstant.ANSWER_WRONG, vo.getIsCorrect());
		assertEquals("解析", vo.getAnalysis());
	}

	@Test
	void toUserSubmitVOMappingHistoryFields() {
		UserSubmit submit = SubmitAssembler.toNewSubmit(9L, validRequest(), question());
		submit.setId(100L);
		submit.setIsCorrect(BusinessConstant.ANSWER_CORRECT);
		submit.setScore(BigDecimal.TEN);
		submit.setCreateTime(LocalDateTime.of(2026, 1, 1, 9, 0));

		UserSubmitVO vo = SubmitAssembler.toUserSubmitVO(submit, question());

		assertEquals(100L, vo.getSubmitId());
		assertEquals(1L, vo.getQuestionId());
		assertEquals("解析", vo.getAnalysis());
		assertEquals(2, vo.getDifficulty());
		assertEquals("2026-01-01T09:00", vo.getCreateTime());
	}

	@Test
	void toUserSubmitVOUsesOfflineTitleWhenQuestionMissing() {
		UserSubmit submit = SubmitAssembler.toNewSubmit(9L, validRequest(), question());

		UserSubmitVO vo = SubmitAssembler.toUserSubmitVO(submit, null);

		assertEquals("题目已下线", vo.getQuestionTitle());
	}

	private SubmitAnswerRequest validRequest() {
		SubmitAnswerRequest request = new SubmitAnswerRequest();
		request.setQuestionId(1L);
		request.setSelectedOptionLabel(" B ");
		request.setSubmitToken(" token-1 ");
		return request;
	}

	private Question question() {
		Question question = new Question();
		question.setId(1L);
		question.setQuestionType(1);
		question.setCorrectOptionLabel("A");
		question.setTitle("HashMap");
		question.setCategory("Java");
		question.setDifficulty(2);
		question.setAnalysis("解析");
		question.setStatus(BusinessConstant.QUESTION_STATUS_ENABLED);
		return question;
	}
}
