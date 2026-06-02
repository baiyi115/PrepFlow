package com.ai.interview.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ResultUtils;
import com.ai.interview.dto.SubmitAnswerRequest;
import com.ai.interview.service.LearningAnalyticsService;
import com.ai.interview.service.SubmitQueryService;
import com.ai.interview.service.SubmitService;
import com.ai.interview.service.WrongBookService;
import com.ai.interview.vo.CalendarItemVO;
import com.ai.interview.vo.CategoryStatVO;
import com.ai.interview.vo.GroupedWrongBookVO;
import com.ai.interview.vo.SubmitAnswerVO;
import com.ai.interview.vo.UserSubmitVO;
import com.ai.interview.vo.UserWrongBookVO;
import com.ai.interview.vo.WeaknessAnalysisVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SubmitController {

	@Resource
	private SubmitService submitService;

	@Resource
	private SubmitQueryService submitQueryService;

	@Resource
	private WrongBookService wrongBookService;

	@Resource
	private LearningAnalyticsService learningAnalyticsService;

	@PostMapping("/api/submits")
	public BaseResponse<SubmitAnswerVO> submitAnswer(@RequestBody SubmitAnswerRequest request) {
		return ResultUtils.success(submitService.submitAnswer(request));
	}

	@GetMapping("/api/submits")
	public BaseResponse<List<UserSubmitVO>> getUserSubmits() {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(submitQueryService.getUserSubmits(userId));
	}

	@GetMapping("/api/submits/wrongs")
	public BaseResponse<List<UserWrongBookVO>> getWrongSubmits() {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(wrongBookService.getWrongSubmits(userId));
	}

	@GetMapping("/api/submits/wrongs/grouped-by-category")
	public BaseResponse<List<GroupedWrongBookVO>> getWrongSubmitsGrouped() {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(wrongBookService.getWrongSubmitsGrouped(userId));
	}

	@GetMapping("/api/submits/calendar")
	public BaseResponse<List<CalendarItemVO>> getCalendarData(@RequestParam(defaultValue = "365") int days) {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(learningAnalyticsService.getCalendarData(userId, days));
	}

	@GetMapping("/api/submits/statistics/category")
	public BaseResponse<List<CategoryStatVO>> getCategoryStatistics() {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(learningAnalyticsService.getCategoryStatistics(userId));
	}

	@GetMapping("/api/submits/analysis/weakness")
	public BaseResponse<List<WeaknessAnalysisVO>> getWeaknessAnalysis() {
		Long userId = StpUtil.getLoginIdAsLong();
		return ResultUtils.success(learningAnalyticsService.analyzeWeakness(userId));
	}
}
