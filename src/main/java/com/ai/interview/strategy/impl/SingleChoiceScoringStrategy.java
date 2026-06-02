package com.ai.interview.strategy.impl;
 
 import com.ai.interview.common.ErrorCode;
 import com.ai.interview.constant.BusinessConstant;
 import com.ai.interview.entity.Question;
 import com.ai.interview.entity.UserSubmit;
 import com.ai.interview.exception.BusinessException;
 import com.ai.interview.strategy.ScoringStrategy;
 import org.springframework.stereotype.Component;
 
 import java.math.BigDecimal;
 
 @Component
 public class SingleChoiceScoringStrategy implements ScoringStrategy {
 
 	@Override
 	public UserSubmit doScore(Question question, UserSubmit userSubmit) {
 		String correctOptionLabel = question.getCorrectOptionLabel();
 		if (correctOptionLabel == null || correctOptionLabel.trim().isEmpty()) {
 			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "题目没有正确答案");
 		}
 		correctOptionLabel = correctOptionLabel.trim();
 
 		String selectedOptionLabel = userSubmit.getSelectedOptionLabel();
 		if (selectedOptionLabel == null) {
 			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户选择答案为空");
 		}
 		selectedOptionLabel = selectedOptionLabel.trim();
 
 		Integer isCorrect;
 		if (correctOptionLabel.equals(selectedOptionLabel)) {
 			isCorrect = BusinessConstant.ANSWER_CORRECT;
 		} else {
 			isCorrect = BusinessConstant.ANSWER_WRONG;
 		}
 
 		BigDecimal score = (BusinessConstant.ANSWER_CORRECT == isCorrect)
 				? new BigDecimal("100.00")
 				: new BigDecimal("0.00");
 
 		userSubmit.setIsCorrect(isCorrect);
 		userSubmit.setScore(score);
 		return userSubmit;
 	}
 
 	@Override
 	public int getQuestionType() {
 		return BusinessConstant.QUESTION_TYPE_SINGLE_CHOICE;
 	}
 }
