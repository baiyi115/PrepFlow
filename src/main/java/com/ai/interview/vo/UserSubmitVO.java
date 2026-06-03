package com.ai.interview.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserSubmitVO {

	@JsonSerialize(using = ToStringSerializer.class)
	private Long submitId;

	@JsonSerialize(using = ToStringSerializer.class)
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
