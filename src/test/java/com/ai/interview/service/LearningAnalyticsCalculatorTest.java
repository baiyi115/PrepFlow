package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.vo.CategoryStatVO;
import com.ai.interview.vo.WeaknessAnalysisVO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LearningAnalyticsCalculatorTest {

	@Test
	void calculateCategoryStatisticsGroupsSubmitsByQuestionCategory() {
		List<CategoryStatVO> stats = LearningAnalyticsCalculator.calculateCategoryStatistics(
				List.of(submit(1L, BusinessConstant.ANSWER_CORRECT), submit(2L, BusinessConstant.ANSWER_WRONG)),
				Map.of(1L, question("Java"), 2L, question("Java"))
		);

		assertEquals(1, stats.size());
		assertEquals("Java", stats.get(0).getCategory());
		assertEquals(2, stats.get(0).getTotalCount());
		assertEquals(1, stats.get(0).getCorrectCount());
		assertEquals(1, stats.get(0).getWrongCount());
		assertEquals(new BigDecimal("50.00"), stats.get(0).getCorrectRate());
	}

	@Test
	void analyzeWeaknessClassifiesByCorrectRate() {
		CategoryStatVO stat = new CategoryStatVO();
		stat.setCategory("JVM");
		stat.setCorrectRate(new BigDecimal("75.00"));

		WeaknessAnalysisVO vo = LearningAnalyticsCalculator.analyzeWeakness(List.of(stat)).get(0);

		assertEquals("JVM", vo.getCategory());
		assertEquals(new BigDecimal("75.00"), vo.getCorrectRate());
		assertEquals("一般", vo.getLevel());
		assertEquals("JVM方面需要提升", vo.getSuggestion());
	}

	private UserSubmit submit(Long questionId, Integer isCorrect) {
		UserSubmit submit = new UserSubmit();
		submit.setQuestionId(questionId);
		submit.setIsCorrect(isCorrect);
		return submit;
	}

	private Question question(String category) {
		Question question = new Question();
		question.setCategory(category);
		return question;
	}
}
