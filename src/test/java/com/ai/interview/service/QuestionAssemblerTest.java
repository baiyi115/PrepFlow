package com.ai.interview.service;

import com.ai.interview.dto.AdminAddOptionRequest;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionOptionVO;
import com.ai.interview.vo.QuestionVO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class QuestionAssemblerTest {

	@Test
	void toDetailVOHidesAnswerWhenRequested() {
		Question question = question();
		QuestionDetailVO vo = QuestionAssembler.toDetailVO(question, List.of(option()), false);

		assertEquals(1L, vo.getId());
		assertEquals("Java 基础", vo.getTitle());
		assertNull(vo.getCorrectOptionLabel());
		assertNull(vo.getAnalysis());
		assertEquals(1, vo.getOptions().size());
		assertEquals("A", vo.getOptions().get(0).getOptionLabel());
	}

	@Test
	void toDetailVOIncludesAnswerForAdminView() {
		QuestionDetailVO vo = QuestionAssembler.toDetailVO(question(), List.of(option()), true);

		assertEquals("A", vo.getCorrectOptionLabel());
		assertEquals("解析", vo.getAnalysis());
	}

	@Test
	void toQuestionVOMapsListFields() {
		QuestionVO vo = QuestionAssembler.toQuestionVO(question());

		assertEquals(1L, vo.getId());
		assertEquals("Java 基础", vo.getTitle());
		assertEquals("Java", vo.getCategory());
		assertEquals(1, vo.getDifficulty());
		assertEquals(1, vo.getQuestionType());
	}

	@Test
	void toOptionEntityDefaultsMissingSortOrder() {
		AdminAddOptionRequest request = new AdminAddOptionRequest();
		request.setOptionLabel(" A ");
		request.setOptionContent(" 内容 ");

		QuestionOption option = QuestionAssembler.toOptionEntity(10L, request);

		assertEquals(10L, option.getQuestionId());
		assertEquals("A", option.getOptionLabel());
		assertEquals("内容", option.getOptionContent());
		assertEquals(0, option.getSortOrder());
	}

	@Test
	void toOptionVOMapsOptionFields() {
		QuestionOptionVO vo = QuestionAssembler.toOptionVO(option());

		assertEquals("A", vo.getOptionLabel());
		assertEquals("选项 A", vo.getOptionContent());
		assertEquals(1, vo.getSortOrder());
	}

	@Test
	void toNewQuestionTrimsRequestFields() {
		AdminAddQuestionRequest request = new AdminAddQuestionRequest();
		request.setTitle(" 标题 ");
		request.setContent(" 内容 ");
		request.setCategory(" 分类 ");
		request.setDifficulty(1);
		request.setQuestionType(1);
		request.setCorrectOptionLabel(" A ");
		request.setAnalysis(" 解析 ");

		Question question = QuestionAssembler.toNewQuestion(request);

		assertEquals("标题", question.getTitle());
		assertEquals("内容", question.getContent());
		assertEquals("分类", question.getCategory());
		assertEquals("A", question.getCorrectOptionLabel());
		assertEquals("解析", question.getAnalysis());
	}

	private Question question() {
		Question question = new Question();
		question.setId(1L);
		question.setTitle("Java 基础");
		question.setContent("题干");
		question.setCategory("Java");
		question.setDifficulty(1);
		question.setQuestionType(1);
		question.setCorrectOptionLabel("A");
		question.setAnalysis("解析");
		return question;
	}

	private QuestionOption option() {
		QuestionOption option = new QuestionOption();
		option.setQuestionId(1L);
		option.setOptionLabel("A");
		option.setOptionContent("选项 A");
		option.setSortOrder(1);
		return option;
	}
}
