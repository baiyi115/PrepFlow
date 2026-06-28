package com.ai.interview.service;

import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserWrongBook;
import com.ai.interview.vo.GroupedWrongBookVO;
import com.ai.interview.vo.UserWrongBookVO;

import java.time.LocalDateTime;
import java.util.List;

final class WrongBookAssembler {

	private WrongBookAssembler() {
	}

	static UserWrongBookVO toWrongBookVO(UserWrongBook wrongBook, Question question) {
		UserWrongBookVO vo = new UserWrongBookVO();
		vo.setId(wrongBook.getId());
		vo.setQuestionId(wrongBook.getQuestionId());
		vo.setTitle(question.getTitle());
		vo.setCategory(question.getCategory());
		vo.setDifficulty(question.getDifficulty());
		vo.setReviewStage(wrongBook.getReviewStage());
		vo.setNextReviewTime(wrongBook.getNextReviewTime());
		return vo;
	}

	static GroupedWrongBookVO toGroupedVO(String category, List<UserWrongBookVO> list, LocalDateTime now) {
		GroupedWrongBookVO groupVO = new GroupedWrongBookVO();
		groupVO.setCategory(category);
		groupVO.setList(list);
		groupVO.setTotalCount(list.size());
		groupVO.setDueCount((int) list.stream()
				.filter(item -> item.getNextReviewTime() == null || !now.isBefore(item.getNextReviewTime()))
				.count());
		return groupVO;
	}
}
