package com.ai.interview.strategy;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ScoringContext {

	@Resource
	private List<ScoringStrategy> strategyList;

	private final Map<Integer, ScoringStrategy> strategyMap = new HashMap<>();

	@PostConstruct
	public void init() {
		for (ScoringStrategy strategy : strategyList) {
			strategyMap.put(strategy.getQuestionType(), strategy);
		}
	}

	public ScoringStrategy getStrategy(int questionType) {
		return strategyMap.get(questionType);
	}
}
