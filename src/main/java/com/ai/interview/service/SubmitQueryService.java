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

import java.util.ArrayList;
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

		QueryWrapper<UserSubmit> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.orderByDesc("create_time");

		List<UserSubmit> userSubmits = userSubmitMapper.selectList(queryWrapper);
		List<Long> questionIds = userSubmits.stream()
				.map(UserSubmit::getQuestionId)
				.distinct()
				.toList();
		Map<Long, Question> questionMap = questionService.getQuestionMap(questionIds);
		List<UserSubmitVO> userSubmitVOList = new ArrayList<>();
		for (UserSubmit userSubmit : userSubmits) {
			UserSubmitVO userSubmitVO = convertToUserSubmitVO(userSubmit, questionMap.get(userSubmit.getQuestionId()));
			userSubmitVOList.add(userSubmitVO);
		}
		return userSubmitVOList;
	}

	private UserSubmitVO convertToUserSubmitVO(UserSubmit userSubmit, Question question) {
		UserSubmitVO userSubmitVO = new UserSubmitVO();
		userSubmitVO.setSubmitId(userSubmit.getId());
		userSubmitVO.setQuestionId(userSubmit.getQuestionId());
		userSubmitVO.setQuestionType(userSubmit.getQuestionType());
		userSubmitVO.setSelectedOptionLabel(userSubmit.getSelectedOptionLabel());
		userSubmitVO.setCorrectOptionLabel(userSubmit.getCorrectOptionLabel());
		userSubmitVO.setIsCorrect(userSubmit.getIsCorrect());
		userSubmitVO.setScore(userSubmit.getScore());
		userSubmitVO.setSubmitStatus(userSubmit.getSubmitStatus());
		userSubmitVO.setCreateTime(userSubmit.getCreateTime() != null ? userSubmit.getCreateTime().toString() : null);
		if (question != null) {
			userSubmitVO.setQuestionTitle(question.getTitle());
			userSubmitVO.setCategory(question.getCategory());
			userSubmitVO.setAnalysis(question.getAnalysis());
			userSubmitVO.setDifficulty(question.getDifficulty());
		} else {
			userSubmitVO.setQuestionTitle("题目已下线");
		}

		return userSubmitVO;
	}
}
