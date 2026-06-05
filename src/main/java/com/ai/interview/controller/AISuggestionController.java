package com.ai.interview.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ResultUtils;
import com.ai.interview.dto.SuggestionRequest;
import com.ai.interview.service.AISuggestionService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/suggestions")
public class AISuggestionController {

	private final AISuggestionService aiSuggestionService;

	public AISuggestionController(AISuggestionService aiSuggestionService) {
		this.aiSuggestionService = aiSuggestionService;
	}

	@PostMapping("/weakness")
	public BaseResponse<String> suggestion(@RequestBody SuggestionRequest request) {
		Long userId = StpUtil.getLoginIdAsLong();
		String suggestion = aiSuggestionService.generateSuggestion(userId, request.getCategory());
		return ResultUtils.success(suggestion);
	}
}
