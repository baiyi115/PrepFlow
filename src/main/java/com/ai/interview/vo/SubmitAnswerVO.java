package com.ai.interview.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubmitAnswerVO {

	@JsonSerialize(using = ToStringSerializer.class)
	private Long submitId;

	@JsonSerialize(using = ToStringSerializer.class)
	private Long questionId;

	private Integer isCorrect;

	private BigDecimal score;

	private Integer submitStatus;

	private String selectedOptionLabel;

	private String correctOptionLabel;

	private String analysis;
}
