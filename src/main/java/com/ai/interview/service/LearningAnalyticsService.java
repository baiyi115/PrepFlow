package com.ai.interview.service;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
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

import java.util.List;
import java.util.Map;

@Service
public class LearningAnalyticsService {

	private static final int ACTIVE_WRONG_BOOK_STATUS = 0;
	private static final int RECENT_SUBMIT_LIMIT = 20;

	@Resource
	private UserSubmitMapper userSubmitMapper;

	@Resource
	private UserWrongBookMapper userWrongBookMapper;

	@Resource
	private SubmitQueryService submitQueryService;

	@Resource
	private UserService userService;

	@Resource
	private QuestionService questionService;

	public List<CalendarItemVO> getCalendarData(Long userId, int days) {
		validateUserId(userId);
		return userSubmitMapper.selectCalendarData(userId, days);
	}

	public List<CategoryStatVO> getCategoryStatistics(Long userId) {
		validateUserId(userId);
		List<UserSubmit> userSubmits = listUserSubmits(userId);
		Map<Long, Question> questionMap = questionService.getQuestionMap(questionIdsOf(userSubmits));
		return LearningAnalyticsCalculator.calculateCategoryStatistics(userSubmits, questionMap);
	}

	public List<WeaknessAnalysisVO> analyzeWeakness(Long userId) {
		return analyzeWeakness(getCategoryStatistics(userId));
	}

	public List<WeaknessAnalysisVO> analyzeWeakness(List<CategoryStatVO> categoryStatList) {
		return LearningAnalyticsCalculator.analyzeWeakness(categoryStatList);
	}

	public UserProfileVO getUserProfile() {
		Long userId = StpUtil.getLoginIdAsLong();
		List<UserSubmitVO> allSubmits = submitQueryService.getUserSubmits(userId);
		int correct = countCorrect(allSubmits);

		UserProfileVO profileVO = new UserProfileVO();
		profileVO.setUserProfile(userService.getLoginUser());
		profileVO.setTotalCount(allSubmits.size());
		profileVO.setCorrectCount(correct);
		profileVO.setWrongCount(allSubmits.size() - correct);
		profileVO.setCorrectRate(LearningAnalyticsCalculator.calculateCorrectRate(correct, allSubmits.size()));
		profileVO.setRecentSubmits(allSubmits.subList(0, Math.min(RECENT_SUBMIT_LIMIT, allSubmits.size())));
		profileVO.setActiveWrongCount(countActiveWrongBooks(userId));

		List<CategoryStatVO> categoryStats = getCategoryStatistics(userId);
		profileVO.setCategoryStats(categoryStats);
		profileVO.setWeaknesses(analyzeWeakness(categoryStats));
		return profileVO;
	}

	private void validateUserId(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}
	}

	private List<UserSubmit> listUserSubmits(Long userId) {
		QueryWrapper<UserSubmit> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		return userSubmitMapper.selectList(queryWrapper);
	}

	private List<Long> questionIdsOf(List<UserSubmit> userSubmits) {
		return userSubmits.stream()
				.map(UserSubmit::getQuestionId)
				.distinct()
				.toList();
	}

	private int countCorrect(List<UserSubmitVO> submits) {
		return (int) submits.stream()
				.filter(submit -> Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(submit.getIsCorrect()))
				.count();
	}

	private int countActiveWrongBooks(Long userId) {
		QueryWrapper<UserWrongBook> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("status", ACTIVE_WRONG_BOOK_STATUS);
		return Math.toIntExact(userWrongBookMapper.selectCount(queryWrapper));
	}
}
