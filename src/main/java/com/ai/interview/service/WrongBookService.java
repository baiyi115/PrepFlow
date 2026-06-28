package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserWrongBook;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.UserWrongBookMapper;
import com.ai.interview.vo.GroupedWrongBookVO;
import com.ai.interview.vo.UserWrongBookVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WrongBookService {

	private static final int ACTIVE_STATUS = 0;

	@Resource
	private UserWrongBookMapper userWrongBookMapper;

	@Resource
	private QuestionMapper questionMapper;

	public List<UserWrongBookVO> getWrongSubmits(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}

		List<UserWrongBook> wrongBooks = listActiveWrongBooks(userId);
		Map<Long, Question> questionMap = getQuestionMap(wrongBooks);
		return wrongBooks.stream()
				.map(wrongBook -> toWrongBookVO(wrongBook, questionMap))
				.filter(Objects::nonNull)
				.toList();
	}

	public List<GroupedWrongBookVO> getWrongSubmitsGrouped(Long userId) {
		Map<String, List<UserWrongBookVO>> groupedMap = getWrongSubmits(userId).stream()
				.collect(Collectors.groupingBy(UserWrongBookVO::getCategory));
		LocalDateTime now = LocalDateTime.now();
		return groupedMap.entrySet().stream()
				.map(entry -> WrongBookAssembler.toGroupedVO(entry.getKey(), entry.getValue(), now))
				.toList();
	}

	public void updateWrongBookStatus(Long userId, Long questionId, Integer isCorrect) {
		UserWrongBook record = findWrongBook(userId, questionId);
		LocalDateTime now = LocalDateTime.now();

		if (Integer.valueOf(BusinessConstant.ANSWER_WRONG).equals(isCorrect)) {
			saveFirstStageRecord(userId, questionId, record, now);
		} else if (Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(isCorrect)
				&& WrongBookReviewPolicy.advanceAfterCorrect(record, now)) {
			userWrongBookMapper.updateById(record);
		}
	}

	private List<UserWrongBook> listActiveWrongBooks(Long userId) {
		QueryWrapper<UserWrongBook> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("status", ACTIVE_STATUS);
		queryWrapper.orderByAsc("next_review_time");
		return userWrongBookMapper.selectList(queryWrapper);
	}

	private Map<Long, Question> getQuestionMap(List<UserWrongBook> wrongBooks) {
		List<Long> questionIds = wrongBooks.stream()
				.map(UserWrongBook::getQuestionId)
				.distinct()
				.toList();
		if (questionIds.isEmpty()) {
			return Map.of();
		}
		return questionMapper.selectBatchIds(questionIds).stream()
				.collect(Collectors.toMap(Question::getId, question -> question));
	}

	private UserWrongBookVO toWrongBookVO(UserWrongBook wrongBook, Map<Long, Question> questionMap) {
		Question question = questionMap.get(wrongBook.getQuestionId());
		return question == null ? null : WrongBookAssembler.toWrongBookVO(wrongBook, question);
	}

	private UserWrongBook findWrongBook(Long userId, Long questionId) {
		QueryWrapper<UserWrongBook> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("question_id", questionId);
		return userWrongBookMapper.selectOne(queryWrapper);
	}

	private void saveFirstStageRecord(Long userId, Long questionId, UserWrongBook record, LocalDateTime now) {
		if (record == null) {
			try {
				userWrongBookMapper.insert(WrongBookReviewPolicy.newFirstStage(userId, questionId, now));
			} catch (DuplicateKeyException e) {
				resetWrongBookToFirstStage(userId, questionId, now);
			}
			return;
		}
		WrongBookReviewPolicy.resetToFirstStage(record, now);
		userWrongBookMapper.updateById(record);
	}

	private void resetWrongBookToFirstStage(Long userId, Long questionId, LocalDateTime now) {
		UserWrongBook record = findWrongBook(userId, questionId);
		if (record != null) {
			WrongBookReviewPolicy.resetToFirstStage(record, now);
			userWrongBookMapper.updateById(record);
		}
	}
}
