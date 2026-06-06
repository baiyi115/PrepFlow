package com.ai.interview.service;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.User;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.entity.UserWrongBook;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.UserSubmitMapper;
import com.ai.interview.mapper.UserWrongBookMapper;
import com.ai.interview.vo.CalendarItemVO;
import com.ai.interview.vo.CategoryStatVO;
import com.ai.interview.vo.UserProfileVO;
import com.ai.interview.vo.UserSubmitVO;
import com.ai.interview.vo.WeaknessAnalysisVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LearningAnalyticsService {

	@Resource
	private UserSubmitMapper userSubmitMapper;

	@Resource
	private UserWrongBookMapper userWrongBookMapper;

	@Resource
	private SubmitQueryService submitQueryService;

	@Resource
	private UserService userService;

	@Resource
	private SubmitService submitService;

	@Resource
	private QuestionService questionService;

	public List<CalendarItemVO> getCalendarData(Long userId, int days) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}
		return userSubmitMapper.selectCalendarData(userId, days);
	}

	public List<CategoryStatVO> getCategoryStatistics(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}

		QueryWrapper<UserSubmit> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		List<UserSubmit> userSubmits = userSubmitMapper.selectList(queryWrapper);
		List<Long> questionIds = userSubmits.stream()
				.map(UserSubmit::getQuestionId)
				.distinct()
				.toList();
		Map<Long, Question> questionMap = questionService.getQuestionMap(questionIds);
		Map<String, CategoryStatVO> categoryStatMap = new HashMap<>();
		for (UserSubmit userSubmit : userSubmits) {
			Question question = questionMap.get(userSubmit.getQuestionId());
			if (question == null) {
				continue;
			}
			String category = question.getCategory();
			CategoryStatVO categoryStatVO = categoryStatMap.get(category);
			if (categoryStatVO == null) {
				categoryStatVO = new CategoryStatVO();
				categoryStatVO.setCategory(category);
				categoryStatVO.setTotalCount(0);
				categoryStatVO.setCorrectCount(0);
				categoryStatVO.setWrongCount(0);
				categoryStatMap.put(category, categoryStatVO);
			}

			categoryStatVO.setTotalCount(categoryStatVO.getTotalCount() + 1);
			if (Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(userSubmit.getIsCorrect())) {
				categoryStatVO.setCorrectCount(categoryStatVO.getCorrectCount() + 1);
			} else {
				categoryStatVO.setWrongCount(categoryStatVO.getWrongCount() + 1);
			}
		}

		for (CategoryStatVO categoryStatVO : categoryStatMap.values()) {
			BigDecimal correctRate = BigDecimal.valueOf(categoryStatVO.getCorrectCount())
					.multiply(new BigDecimal("100"))
					.divide(BigDecimal.valueOf(categoryStatVO.getTotalCount()), 2, RoundingMode.HALF_UP);
			categoryStatVO.setCorrectRate(correctRate);
		}
		return new ArrayList<>(categoryStatMap.values());
	}

	public List<WeaknessAnalysisVO> analyzeWeakness(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}
		return analyzeWeakness(getCategoryStatistics(userId));
	}

	public List<WeaknessAnalysisVO> analyzeWeakness(List<CategoryStatVO> categoryStatList) {
		List<WeaknessAnalysisVO> weaknessAnalysisList = new ArrayList<>();

		for (CategoryStatVO categoryStatVO : categoryStatList) {
			String level;
			if (categoryStatVO.getCorrectRate().compareTo(new BigDecimal("60.00")) < 0) {
				level = "薄弱";
			} else if (categoryStatVO.getCorrectRate().compareTo(new BigDecimal("80.00")) < 0) {
				level = "一般";
			} else {
				level = "良好";
			}
			String suggestion;
			if ("薄弱".equals(level)) {
				suggestion = categoryStatVO.getCategory() + "方面需要加强";
			} else if ("一般".equals(level)) {
				suggestion = categoryStatVO.getCategory() + "方面需要提升";
			} else {
				suggestion = categoryStatVO.getCategory() + "方面表现良好";
			}

			WeaknessAnalysisVO weaknessAnalysisVO = new WeaknessAnalysisVO();
			weaknessAnalysisVO.setCategory(categoryStatVO.getCategory());
			weaknessAnalysisVO.setCorrectRate(categoryStatVO.getCorrectRate());
			weaknessAnalysisVO.setLevel(level);
			weaknessAnalysisVO.setSuggestion(suggestion);

			weaknessAnalysisList.add(weaknessAnalysisVO);
		}
		return weaknessAnalysisList;
	}

	public UserProfileVO getUserProfile() {
		Long userId= StpUtil.getLoginIdAsLong();
		UserProfileVO profileVO = new UserProfileVO();

		profileVO.setUserProfile(userService.getLoginUser());

		List<UserSubmitVO> allSubmits = submitQueryService.getUserSubmits(userId);
		profileVO.setTotalCount(allSubmits.size());
		int correct = (int) allSubmits.stream()
				.filter(s-> Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(s.getIsCorrect()))
				.count();

		profileVO.setCorrectCount(correct);
		profileVO.setWrongCount(allSubmits.size()-correct);

		BigDecimal rate = allSubmits.isEmpty()? new BigDecimal("0.00"):
				BigDecimal.valueOf(correct).multiply(new BigDecimal("100"))
						.divide(BigDecimal.valueOf(allSubmits.size()),2,RoundingMode.HALF_UP);
		profileVO.setCorrectRate(rate);

		profileVO.setRecentSubmits(allSubmits.subList(0,Math.min(20,allSubmits.size())));

		QueryWrapper<UserWrongBook> qw = new QueryWrapper<>();
		qw.eq("user_id",userId).eq("status",0);
		profileVO.setActiveWrongCount(Math.toIntExact(userWrongBookMapper.selectCount(qw)));

		List<CategoryStatVO> categoryStats = getCategoryStatistics(userId);
		profileVO.setCategoryStats(categoryStats);
		profileVO.setWeaknesses(analyzeWeakness(categoryStats));

		return profileVO;
	}
}
