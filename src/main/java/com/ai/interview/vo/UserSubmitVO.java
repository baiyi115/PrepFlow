package com.ai.interview.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserSubmitVO {

	private Long submitId;

	private Long questionId;

	private Integer questionType;

	private String selectedOptionLabel;

	private String correctOptionLabel;

	private Integer isCorrect;

	private BigDecimal score;

	private Integer submitStatus;

	private String createTime;

	private String questionTitle;

	private String category;

	private Integer difficulty;

	private String analysis;
}
