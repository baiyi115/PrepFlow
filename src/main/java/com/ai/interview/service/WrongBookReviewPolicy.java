package com.ai.interview.service;

import com.ai.interview.entity.UserWrongBook;

import java.time.LocalDateTime;

final class WrongBookReviewPolicy {

	private static final int ACTIVE_STATUS = 0;
	private static final int MASTERED_STATUS = 1;

	private WrongBookReviewPolicy() {
	}

	static UserWrongBook newFirstStage(Long userId, Long questionId, LocalDateTime now) {
		UserWrongBook record = new UserWrongBook();
		record.setUserId(userId);
		record.setQuestionId(questionId);
		resetToFirstStage(record, now);
		return record;
	}

	static void resetToFirstStage(UserWrongBook record, LocalDateTime now) {
		record.setReviewStage(1);
		record.setNextReviewTime(now.plusDays(1));
		record.setStatus(ACTIVE_STATUS);
	}

	static boolean advanceAfterCorrect(UserWrongBook record, LocalDateTime now) {
		if (record == null || Integer.valueOf(MASTERED_STATUS).equals(record.getStatus())) {
			return false;
		}
		LocalDateTime nextReviewTime = record.getNextReviewTime();
		if (nextReviewTime != null && now.isBefore(nextReviewTime)) {
			return false;
		}

		int nextStage = record.getReviewStage() + 1;
		record.setReviewStage(nextStage);
		if (nextStage >= 4) {
			record.setStatus(MASTERED_STATUS);
		} else if (nextStage == 2) {
			record.setNextReviewTime(now.plusDays(3));
		} else if (nextStage == 3) {
			record.setNextReviewTime(now.plusDays(7));
		}
		return true;
	}
}
