package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.entity.UserSubmit;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AiPromptBuilderTest {

	@Test
	void deepAnalysisPromptIncludesWrongAnswerContext() {
		String prompt = AiPromptBuilder.deepAnalysisPrompt(question(), wrongSubmit(), options());

		assertTrue(prompt.contains("指出错误原因"));
		assertTrue(prompt.contains("题目：《HashMap 原理》"));
		assertTrue(prompt.contains("题目内容：《说明扩容机制》"));
		assertTrue(prompt.contains("你的答案：B. 链表永不转树"));
		assertTrue(prompt.contains("正确答案：A. 红黑树降低查询复杂度"));
		assertTrue(prompt.contains("题目解析：《JDK 8 中链表过长会转为红黑树》"));
	}

	@Test
	void deepAnalysisPromptUsesSummaryGuidanceForCorrectSubmit() {
		UserSubmit submit = wrongSubmit();
		submit.setIsCorrect(BusinessConstant.ANSWER_CORRECT);

		String prompt = AiPromptBuilder.deepAnalysisPrompt(question(), submit, options());

		assertTrue(prompt.contains("深入总结核心知识点"));
		assertTrue(prompt.contains("你的答案：B. 链表永不转树"));
	}

	private Question question() {
		Question question = new Question();
		question.setTitle("HashMap 原理");
		question.setContent("说明扩容机制");
		question.setAnalysis("JDK 8 中链表过长会转为红黑树");
		return question;
	}

	private UserSubmit wrongSubmit() {
		UserSubmit submit = new UserSubmit();
		submit.setSelectedOptionLabel("B");
		submit.setCorrectOptionLabel("A");
		submit.setIsCorrect(BusinessConstant.ANSWER_WRONG);
		return submit;
	}

	private List<QuestionOption> options() {
		QuestionOption correct = new QuestionOption();
		correct.setOptionLabel("A");
		correct.setOptionContent("红黑树降低查询复杂度");

		QuestionOption selected = new QuestionOption();
		selected.setOptionLabel("B");
		selected.setOptionContent("链表永不转树");

		return List.of(correct, selected);
	}
}
