package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.entity.UserSubmit;

import java.util.List;

final class AiPromptBuilder {

	private static final String CHAT_SYSTEM_PROMPT = "你是一位资深的 IT 面试教练，请详细解答用户的问题。"
			+ "回答要深入浅出，结合实际代码示例。";

	private static final String CORRECT_ANALYSIS_GUIDANCE = "分析这道面试题，深入总结核心知识点"
			+ "（控制在 200-300 字，用 3-5 个要点列出关键概念和原理，不要输出无关内容，不要包含任何第三方称呼）：";

	private static final String WRONG_ANALYSIS_GUIDANCE = "分析这道面试题，指出错误原因并深入解析"
			+ "（控制在 200-300 字，用 3-5 个要点列出正确概念和易错点，不要输出无关内容，不要包含任何第三方称呼）：";

	private AiPromptBuilder() {
	}

	static String chatSystemPrompt() {
		return CHAT_SYSTEM_PROMPT;
	}

	static String deepAnalysisPrompt(Question question, UserSubmit submit, List<QuestionOption> options) {
		String selectedOptContent = optionContent(options, submit.getSelectedOptionLabel());
		String correctOptContent = optionContent(options, submit.getCorrectOptionLabel());
		String guidance = isCorrect(submit) ? CORRECT_ANALYSIS_GUIDANCE : WRONG_ANALYSIS_GUIDANCE;

		return guidance
				+ "\n题目：《" + nullToEmpty(question.getTitle()) + "》"
				+ questionContent(question)
				+ "\n你的答案：" + nullToEmpty(submit.getSelectedOptionLabel()) + ". " + selectedOptContent
				+ "\n正确答案：" + nullToEmpty(submit.getCorrectOptionLabel()) + ". " + correctOptContent
				+ "\n题目解析：《" + nullToDefault(question.getAnalysis(), "无") + "》";
	}

	private static String optionContent(List<QuestionOption> options, String label) {
		if (label == null) {
			return "";
		}
		return options.stream()
				.filter(option -> label.equals(option.getOptionLabel()))
				.findFirst()
				.map(QuestionOption::getOptionContent)
				.orElse("");
	}

	private static boolean isCorrect(UserSubmit submit) {
		return Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(submit.getIsCorrect());
	}

	private static String questionContent(Question question) {
		if (question.getContent() == null || question.getContent().isBlank()) {
			return "";
		}
		return "\n题目内容：《" + question.getContent() + "》";
	}

	private static String nullToEmpty(String value) {
		return value == null ? "" : value;
	}

	private static String nullToDefault(String value, String defaultValue) {
		return value == null ? defaultValue : value;
	}
}
