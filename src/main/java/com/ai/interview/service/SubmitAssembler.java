package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.vo.SubmitAnswerVO;
import com.ai.interview.vo.UserSubmitVO;

final class SubmitAssembler {

	private SubmitAssembler() {
	}

	static UserSubmit toNewSubmit(Long userId, SubmitAnswerRequest request, Question question) {
		UserSubmit userSubmit = new UserSubmit();
		userSubmit.setUserId(userId);
		userSubmit.setQuestionId(request.getQuestionId());
		userSubmit.setQuestionType(question.getQuestionType());
		userSubmit.setSelectedOptionLabel(request.getSelectedOptionLabel().trim());
		userSubmit.setCorrectOptionLabel(question.getCorrectOptionLabel());
		userSubmit.setSubmitStatus(BusinessConstant.SUBMIT_STATUS_FINISHED);
		userSubmit.setSubmitToken(request.getSubmitToken().trim());
		return userSubmit;
	}

	static SubmitAnswerVO toSubmitAnswerVO(UserSubmit userSubmit, Question question) {
		SubmitAnswerVO submitAnswerVO = new SubmitAnswerVO();
		submitAnswerVO.setSubmitId(userSubmit.getId());
		submitAnswerVO.setQuestionId(userSubmit.getQuestionId());
		submitAnswerVO.setIsCorrect(userSubmit.getIsCorrect());
		submitAnswerVO.setScore(userSubmit.getScore());
		submitAnswerVO.setSubmitStatus(userSubmit.getSubmitStatus());
		submitAnswerVO.setSelectedOptionLabel(userSubmit.getSelectedOptionLabel());
		submitAnswerVO.setCorrectOptionLabel(userSubmit.getCorrectOptionLabel());
		submitAnswerVO.setAnalysis(question.getAnalysis());
		return submitAnswerVO;
	}

	static UserSubmitVO toUserSubmitVO(UserSubmit userSubmit, Question question) {
		UserSubmitVO userSubmitVO = new UserSubmitVO();
		userSubmitVO.setSubmitId(userSubmit.getId());
		userSubmitVO.setQuestionId(userSubmit.getQuestionId());
		userSubmitVO.setQuestionType(userSubmit.getQuestionType());
		userSubmitVO.setSelectedOptionLabel(userSubmit.getSelectedOptionLabel());
		userSubmitVO.setCorrectOptionLabel(userSubmit.getCorrectOptionLabel());
		userSubmitVO.setIsCorrect(userSubmit.getIsCorrect());
		userSubmitVO.setScore(userSubmit.getScore());
		userSubmitVO.setSubmitStatus(userSubmit.getSubmitStatus());
		userSubmitVO.setCreateTime(userSubmit.getCreateTime() != null ? userSubmit.getCreateTime().toString() : null);
		if (question == null) {
			userSubmitVO.setQuestionTitle("题目已下线");
			return userSubmitVO;
		}
		userSubmitVO.setQuestionTitle(question.getTitle());
		userSubmitVO.setCategory(question.getCategory());
		userSubmitVO.setAnalysis(question.getAnalysis());
		userSubmitVO.setDifficulty(question.getDifficulty());
		return userSubmitVO;
	}
}
