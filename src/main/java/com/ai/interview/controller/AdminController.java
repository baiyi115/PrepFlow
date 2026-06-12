package com.ai.interview.controller;

import com.ai.interview.common.BaseResponse;
import com.ai.interview.common.ResultUtils;
import com.ai.interview.dto.AdminAddQuestionRequest;
import com.ai.interview.dto.AdminUpdateQuestionRequest;
import com.ai.interview.dto.AdminUpdateUserStatusRequest;
import com.ai.interview.service.AdminQuestionService;
import com.ai.interview.service.AdminUserService;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.UserVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminController {

	@Resource
	private AdminQuestionService adminQuestionService;

	@Resource
	private AdminUserService adminUserService;

	@PostMapping("/api/admin/questions")
	public BaseResponse<Long> addQuestion(@RequestBody AdminAddQuestionRequest request) {
		return ResultUtils.success(adminQuestionService.addQuestion(request));
	}

	@PutMapping("/api/admin/questions")
	public BaseResponse<Boolean> updateQuestion(@RequestBody AdminUpdateQuestionRequest request) {
		adminQuestionService.updateQuestion(request);
		return ResultUtils.success(true);
	}

	@DeleteMapping("/api/admin/questions/{questionId}")
	public BaseResponse<Boolean> deleteQuestion(@PathVariable Long questionId) {
		adminQuestionService.deleteQuestion(questionId);
		return ResultUtils.success(true);
	}

	@GetMapping("/api/admin/questions/{questionId}")
	public BaseResponse<QuestionDetailVO> getQuestionDetail(@PathVariable Long questionId) {
		return ResultUtils.success(adminQuestionService.getQuestionDetail(questionId));
	}

	@GetMapping("/api/admin/questions")
	public BaseResponse<List<QuestionDetailVO>> listQuestions(
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Integer difficulty,
			@RequestParam(required = false) Integer questionType
	) {
		return ResultUtils.success(adminQuestionService.listQuestions(category, difficulty, questionType));
	}

	@GetMapping("/api/admin/users")
	public BaseResponse<List<UserVO>> listUsers() {
		return ResultUtils.success(adminUserService.listUsers());
	}

	@PutMapping("/api/admin/users/status")
	public BaseResponse<Boolean> updateUserStatus(@RequestBody AdminUpdateUserStatusRequest request) {
		adminUserService.updateUserStatus(request);
		return ResultUtils.success(true);
	}
}
