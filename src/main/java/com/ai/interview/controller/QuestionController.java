package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ResultUtils;
import com.ai.interview.service.QuestionService;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QuestionController {

	@Resource
	private QuestionService questionService;

	@GetMapping("/api/questions/{questionId}")
	public BaseResponse<QuestionDetailVO> getQuestionDetail(@PathVariable Long questionId) {
		return ResultUtils.success(questionService.getQuestionDetail(questionId));
	}

	@GetMapping("/api/questions")
	public BaseResponse<List<QuestionVO>> listQuestions() {
		return ResultUtils.success(questionService.listQuestions());
	}
}
