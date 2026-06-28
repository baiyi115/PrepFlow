package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CacheWarmUpService {

	private static final String QUESTION_DETAIL_CACHE_KEY_PREFIX = "question:detail:";

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionQuery questionOptionQuery;

	@Resource
	private Cache<String, Object> caffeineCache;

	@EventListener(ApplicationReadyEvent.class)
	public void warmUpQuestionDetailCache() {
		long startTime = System.currentTimeMillis();
		QueryWrapper<Question> questionQuery = new QueryWrapper<>();
		questionQuery.eq("status", BusinessConstant.QUESTION_STATUS_ENABLED);
		List<Question> questions = questionMapper.selectList(questionQuery);
		if (questions.isEmpty()) {
			log.info("题目详情缓存预热跳过：暂无启用题目");
			return;
		}

		List<Long> questionIds = questions.stream()
				.map(Question::getId)
				.toList();

		Map<Long, List<QuestionOption>> optionMap = questionOptionQuery.listByQuestionIds(questionIds);

		// 预热本地 Caffeine 缓存，减少首次访问题目详情的查询成本。
		for (Question question : questions) {
			QuestionDetailVO detailVO = QuestionAssembler.toDetailVO(question, optionMap.getOrDefault(question.getId(), List.of()), false);
			String cacheKey = QUESTION_DETAIL_CACHE_KEY_PREFIX + question.getId();
			caffeineCache.put(cacheKey, detailVO);
		}

		long costMillis = System.currentTimeMillis() - startTime;
		log.info("题目详情缓存预热完成：启用题目数={}，耗时={}ms", questions.size(), costMillis);
	}

}
