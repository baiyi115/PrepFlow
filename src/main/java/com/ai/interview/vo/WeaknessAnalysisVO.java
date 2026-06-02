package com.ai.interview.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WeaknessAnalysisVO {

	private String category;

	private BigDecimal correctRate;

	private String level;

	private String suggestion;
}
