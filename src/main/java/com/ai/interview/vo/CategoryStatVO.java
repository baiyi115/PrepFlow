package com.ai.interview.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategoryStatVO {
	private String category;
	private Integer totalCount;
	private Integer correctCount;
	private Integer wrongCount;
	private BigDecimal correctRate;
}
