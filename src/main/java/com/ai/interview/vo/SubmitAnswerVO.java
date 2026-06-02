package com.ai.interview.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubmitAnswerVO {

	private Long submitId;

	private Long questionId;

	private Integer isCorrect;

	private BigDecimal score;

	private Integer submitStatus;

	private String selectedOptionLabel;

	private String correctOptionLabel;

	private String analysis;
}
