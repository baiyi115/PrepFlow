package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionOptionVO;
import com.ai.interview.vo.QuestionVO;

import java.util.List;

final class QuestionAssembler {

	private QuestionAssembler() {
	}

	static Question toNewQuestion(AdminAddQuestionRequest request) {
		Question question = new Question();
		question.setTitle(request.getTitle().trim());
		question.setContent(request.getContent().trim());
		question.setCategory(request.getCategory().trim());
		question.setDifficulty(request.getDifficulty());
		question.setQuestionType(request.getQuestionType());
		question.setCorrectOptionLabel(request.getCorrectOptionLabel().trim());
		question.setAnalysis(request.getAnalysis() != null ? request.getAnalysis().trim() : null);
		question.setStatus(BusinessConstant.QUESTION_STATUS_ENABLED);
		return question;
	}

	static Question toUpdateQuestion(AdminUpdateQuestionRequest request) {
		Question question = new Question();
		question.setId(request.getId());
		if (!isBlank(request.getTitle())) {
			question.setTitle(request.getTitle().trim());
		}
		if (!isBlank(request.getContent())) {
			question.setContent(request.getContent().trim());
		}
		if (!isBlank(request.getCategory())) {
			question.setCategory(request.getCategory().trim());
		}
		if (request.getDifficulty() != null) {
			question.setDifficulty(request.getDifficulty());
		}
		if (request.getQuestionType() != null) {
			question.setQuestionType(request.getQuestionType());
		}
		if (request.getCorrectOptionLabel() != null) {
			question.setCorrectOptionLabel(request.getCorrectOptionLabel().trim());
		}
		if (request.getAnalysis() != null) {
			question.setAnalysis(request.getAnalysis().trim());
		}
		if (request.getStatus() != null) {
			question.setStatus(request.getStatus());
		}
		return question;
	}

	static QuestionOption toOptionEntity(Long questionId, AdminAddOptionRequest request) {
		QuestionOption option = new QuestionOption();
		option.setQuestionId(questionId);
		option.setOptionLabel(request.getOptionLabel().trim());
		option.setOptionContent(request.getOptionContent().trim());
		option.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
		return option;
	}

	static QuestionVO toQuestionVO(Question question) {
		QuestionVO questionVO = new QuestionVO();
		questionVO.setId(question.getId());
		questionVO.setTitle(question.getTitle());
		questionVO.setCategory(question.getCategory());
		questionVO.setDifficulty(question.getDifficulty());
		questionVO.setQuestionType(question.getQuestionType());
		return questionVO;
	}

	static QuestionOptionVO toOptionVO(QuestionOption option) {
		QuestionOptionVO optionVO = new QuestionOptionVO();
		optionVO.setOptionLabel(option.getOptionLabel());
		optionVO.setOptionContent(option.getOptionContent());
		optionVO.setSortOrder(option.getSortOrder());
		return optionVO;
	}

	static QuestionDetailVO toDetailVO(Question question, List<QuestionOption> options, boolean includeAnswer) {
		QuestionDetailVO questionDetailVO = new QuestionDetailVO();
		questionDetailVO.setId(question.getId());
		questionDetailVO.setTitle(question.getTitle());
		questionDetailVO.setContent(question.getContent());
		questionDetailVO.setCategory(question.getCategory());
		questionDetailVO.setDifficulty(question.getDifficulty());
		questionDetailVO.setQuestionType(question.getQuestionType());
		questionDetailVO.setOptions(options.stream().map(QuestionAssembler::toOptionVO).toList());
		if (includeAnswer) {
			questionDetailVO.setCorrectOptionLabel(question.getCorrectOptionLabel());
			questionDetailVO.setAnalysis(question.getAnalysis());
		}
		return questionDetailVO;
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
