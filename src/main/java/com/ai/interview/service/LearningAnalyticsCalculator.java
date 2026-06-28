package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.vo.CategoryStatVO;
import com.ai.interview.vo.WeaknessAnalysisVO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class LearningAnalyticsCalculator {

	private static final BigDecimal PERCENT = new BigDecimal("100");
	private static final BigDecimal WEAK_THRESHOLD = new BigDecimal("60.00");
	private static final BigDecimal NORMAL_THRESHOLD = new BigDecimal("80.00");

	private LearningAnalyticsCalculator() {
	}

	static List<CategoryStatVO> calculateCategoryStatistics(List<UserSubmit> userSubmits, Map<Long, Question> questionMap) {
		Map<String, CategoryStatVO> categoryStatMap = new HashMap<>();
		for (UserSubmit userSubmit : userSubmits) {
			Question question = questionMap.get(userSubmit.getQuestionId());
			if (question == null) {
				continue;
			}
			CategoryStatVO stat = categoryStatMap.computeIfAbsent(question.getCategory(), LearningAnalyticsCalculator::newCategoryStat);
			stat.setTotalCount(stat.getTotalCount() + 1);
			if (Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(userSubmit.getIsCorrect())) {
				stat.setCorrectCount(stat.getCorrectCount() + 1);
			} else {
				stat.setWrongCount(stat.getWrongCount() + 1);
			}
		}
		categoryStatMap.values().forEach(LearningAnalyticsCalculator::fillCorrectRate);
		return new ArrayList<>(categoryStatMap.values());
	}

	static List<WeaknessAnalysisVO> analyzeWeakness(List<CategoryStatVO> categoryStatList) {
		return categoryStatList.stream()
				.map(LearningAnalyticsCalculator::toWeaknessAnalysis)
				.toList();
	}

	static BigDecimal calculateCorrectRate(int correctCount, int totalCount) {
		if (totalCount == 0) {
			return new BigDecimal("0.00");
		}
		return BigDecimal.valueOf(correctCount)
				.multiply(PERCENT)
				.divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);
	}

	private static CategoryStatVO newCategoryStat(String category) {
		CategoryStatVO stat = new CategoryStatVO();
		stat.setCategory(category);
		stat.setTotalCount(0);
		stat.setCorrectCount(0);
		stat.setWrongCount(0);
		return stat;
	}

	private static void fillCorrectRate(CategoryStatVO stat) {
		stat.setCorrectRate(calculateCorrectRate(stat.getCorrectCount(), stat.getTotalCount()));
	}

	private static WeaknessAnalysisVO toWeaknessAnalysis(CategoryStatVO stat) {
		String level = levelOf(stat.getCorrectRate());
		WeaknessAnalysisVO vo = new WeaknessAnalysisVO();
		vo.setCategory(stat.getCategory());
		vo.setCorrectRate(stat.getCorrectRate());
		vo.setLevel(level);
		vo.setSuggestion(suggestionOf(stat.getCategory(), level));
		return vo;
	}

	private static String levelOf(BigDecimal correctRate) {
		if (correctRate.compareTo(WEAK_THRESHOLD) < 0) {
			return "薄弱";
		}
		if (correctRate.compareTo(NORMAL_THRESHOLD) < 0) {
			return "一般";
		}
		return "良好";
	}

	private static String suggestionOf(String category, String level) {
		if ("薄弱".equals(level)) {
			return category + "方面需要加强";
		}
		if ("一般".equals(level)) {
			return category + "方面需要提升";
		}
		return category + "方面表现良好";
	}
}
