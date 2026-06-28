package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.UserSubmitMapper;
import com.ai.interview.vo.UserSubmitVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SubmitQueryService {

	@Resource
	private UserSubmitMapper userSubmitMapper;

	@Resource
	private QuestionService questionService;

	public List<UserSubmitVO> getUserSubmits(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}

		List<UserSubmit> userSubmits = listUserSubmits(userId);
		Map<Long, Question> questionMap = questionService.getQuestionMap(questionIdsOf(userSubmits));
		return userSubmits.stream()
				.map(userSubmit -> SubmitAssembler.toUserSubmitVO(userSubmit, questionMap.get(userSubmit.getQuestionId())))
				.toList();
	}

	private List<UserSubmit> listUserSubmits(Long userId) {
		QueryWrapper<UserSubmit> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.orderByDesc("create_time");
		return userSubmitMapper.selectList(queryWrapper);
	}

	private List<Long> questionIdsOf(List<UserSubmit> userSubmits) {
		return userSubmits.stream()
				.map(UserSubmit::getQuestionId)
				.distinct()
				.toList();
	}
}
