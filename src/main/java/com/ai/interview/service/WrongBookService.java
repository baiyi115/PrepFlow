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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WrongBookService {

	@Resource
	private UserWrongBookMapper userWrongBookMapper;

	@Resource
	private QuestionMapper questionMapper;

	public List<UserWrongBookVO> getWrongSubmits(Long userId) {
		if (userId == null || userId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户ID不合法");
		}

		QueryWrapper<UserWrongBook> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("status", 0);
		queryWrapper.orderByAsc("next_review_time");
		List<UserWrongBook> wrongBooks = userWrongBookMapper.selectList(queryWrapper);

		List<UserWrongBookVO> wrongBookVOList = new ArrayList<>();
		for (UserWrongBook wrongBook : wrongBooks) {
			Question question = questionMapper.selectById(wrongBook.getQuestionId());
			if (question == null) {
				continue;
			}
			UserWrongBookVO vo = new UserWrongBookVO();
			vo.setId(wrongBook.getId());
			vo.setQuestionId(wrongBook.getQuestionId());
			vo.setTitle(question.getTitle());
			vo.setCategory(question.getCategory());
			vo.setDifficulty(question.getDifficulty());
			vo.setReviewStage(wrongBook.getReviewStage());
			vo.setNextReviewTime(wrongBook.getNextReviewTime());
			wrongBookVOList.add(vo);
		}
		return wrongBookVOList;
	}

	public List<GroupedWrongBookVO> getWrongSubmitsGrouped(Long userId) {
		List<UserWrongBookVO> wrongList = getWrongSubmits(userId);

		Map<String, List<UserWrongBookVO>> groupedMap = wrongList.stream()
				.collect(Collectors.groupingBy(UserWrongBookVO::getCategory));

		List<GroupedWrongBookVO> result = new ArrayList<>();
		LocalDateTime now = LocalDateTime.now();
		for (Map.Entry<String, List<UserWrongBookVO>> entry : groupedMap.entrySet()) {
			GroupedWrongBookVO groupVO = new GroupedWrongBookVO();
			groupVO.setCategory(entry.getKey());
			
			List<UserWrongBookVO> list = entry.getValue();
			groupVO.setList(list);
			groupVO.setTotalCount(list.size());
			
			// 过滤出当前时间已经到期、需要温习的错题量
			int dueCount = (int) list.stream()
					.filter(item -> item.getNextReviewTime() == null || !now.isBefore(item.getNextReviewTime()))
					.count();
			groupVO.setDueCount(dueCount);
			
			result.add(groupVO);
		}
		return result;
	}

	public void updateWrongBookStatus(Long userId, Long questionId, Integer isCorrect) {
		QueryWrapper<UserWrongBook> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("user_id", userId);
		queryWrapper.eq("question_id", questionId);
		UserWrongBook exitsRecord = userWrongBookMapper.selectOne(queryWrapper);

		if (Integer.valueOf(BusinessConstant.ANSWER_WRONG).equals(isCorrect)) {
			if (exitsRecord == null) {
				UserWrongBook newRecord = new UserWrongBook();
				newRecord.setUserId(userId);
				newRecord.setQuestionId(questionId);
				newRecord.setReviewStage(1);
				newRecord.setNextReviewTime(LocalDateTime.now().plusDays(1)); // 一天后复习
				newRecord.setStatus(0);
				userWrongBookMapper.insert(newRecord);
			} else {
				exitsRecord.setReviewStage(1);
				exitsRecord.setNextReviewTime(LocalDateTime.now().plusDays(1));
				exitsRecord.setStatus(0);
				userWrongBookMapper.updateById(exitsRecord);
			}
		} else if (Integer.valueOf(BusinessConstant.ANSWER_CORRECT).equals(isCorrect)) {
			if (exitsRecord == null || exitsRecord.getStatus() == 1) {
				return;
			}
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime nextReviewTime = exitsRecord.getNextReviewTime();
			// 未到推荐复习时间时，答对不推进阶段，避免短时间连刷导致错题提前移出。
			if (nextReviewTime != null && now.isBefore(nextReviewTime)) {
				return;
			}

			int currentStage = exitsRecord.getReviewStage();
			int nextStage = currentStage + 1;

			if (nextStage >= 4) {
				exitsRecord.setStatus(1);
				exitsRecord.setReviewStage(nextStage);
			} else {
				exitsRecord.setReviewStage(nextStage);
				if (nextStage == 2) {
					exitsRecord.setNextReviewTime(now.plusDays(3));
				} else if (nextStage == 3) {
					exitsRecord.setNextReviewTime(now.plusDays(7));
				}
			}
			userWrongBookMapper.updateById(exitsRecord);
		}
	}
}
