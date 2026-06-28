package com.ai.interview.service;

import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserWrongBook;
import com.ai.interview.vo.GroupedWrongBookVO;
import com.ai.interview.vo.UserWrongBookVO;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WrongBookHelperTest {

	@Test
	void newFirstStageCreatesDueTomorrowRecord() {
		LocalDateTime now = LocalDateTime.of(2026, 1, 1, 9, 0);

		UserWrongBook record = WrongBookReviewPolicy.newFirstStage(1L, 2L, now);

		assertEquals(1L, record.getUserId());
		assertEquals(2L, record.getQuestionId());
		assertEquals(1, record.getReviewStage());
		assertEquals(0, record.getStatus());
		assertEquals(now.plusDays(1), record.getNextReviewTime());
	}

	@Test
	void advanceAfterCorrectMovesDueRecordToNextReviewStage() {
		LocalDateTime now = LocalDateTime.of(2026, 1, 4, 9, 0);
		UserWrongBook record = new UserWrongBook();
		record.setReviewStage(1);
		record.setStatus(0);
		record.setNextReviewTime(now.minusHours(1));

		boolean advanced = WrongBookReviewPolicy.advanceAfterCorrect(record, now);

		assertEquals(true, advanced);
		assertEquals(2, record.getReviewStage());
		assertEquals(now.plusDays(3), record.getNextReviewTime());
		assertEquals(0, record.getStatus());
	}

	@Test
	void advanceAfterCorrectSkipsFutureReviewRecord() {
		LocalDateTime now = LocalDateTime.of(2026, 1, 4, 9, 0);
		UserWrongBook record = new UserWrongBook();
		record.setReviewStage(1);
		record.setStatus(0);
		record.setNextReviewTime(now.plusHours(1));

		boolean advanced = WrongBookReviewPolicy.advanceAfterCorrect(record, now);

		assertEquals(false, advanced);
		assertEquals(1, record.getReviewStage());
		assertEquals(now.plusHours(1), record.getNextReviewTime());
		assertEquals(0, record.getStatus());
	}

	@Test
	void advanceAfterCorrectCompletesStageFour() {
		LocalDateTime now = LocalDateTime.of(2026, 1, 8, 9, 0);
		UserWrongBook record = new UserWrongBook();
		record.setReviewStage(3);
		record.setStatus(0);
		record.setNextReviewTime(now.minusHours(1));

		boolean advanced = WrongBookReviewPolicy.advanceAfterCorrect(record, now);

		assertEquals(true, advanced);
		assertEquals(4, record.getReviewStage());
		assertEquals(1, record.getStatus());
	}

	@Test
	void toWrongBookVOCombinesRecordAndQuestion() {
		UserWrongBookVO vo = WrongBookAssembler.toWrongBookVO(record(), question());

		assertEquals(10L, vo.getId());
		assertEquals(2L, vo.getQuestionId());
		assertEquals("HashMap", vo.getTitle());
		assertEquals("Java", vo.getCategory());
		assertEquals(2, vo.getDifficulty());
	}

	@Test
	void toGroupedVOMarksDueItems() {
		LocalDateTime now = LocalDateTime.of(2026, 1, 1, 9, 0);
		UserWrongBookVO due = new UserWrongBookVO();
		due.setNextReviewTime(now.minusMinutes(1));
		UserWrongBookVO future = new UserWrongBookVO();
		future.setNextReviewTime(now.plusMinutes(1));

		GroupedWrongBookVO vo = WrongBookAssembler.toGroupedVO("Java", List.of(due, future), now);

		assertEquals("Java", vo.getCategory());
		assertEquals(2, vo.getTotalCount());
		assertEquals(1, vo.getDueCount());
	}

	private UserWrongBook record() {
		UserWrongBook record = new UserWrongBook();
		record.setId(10L);
		record.setQuestionId(2L);
		record.setReviewStage(1);
		record.setNextReviewTime(LocalDateTime.of(2026, 1, 1, 9, 0));
		return record;
	}

	private Question question() {
		Question question = new Question();
		question.setTitle("HashMap");
		question.setCategory("Java");
		question.setDifficulty(2);
		return question;
	}
}
