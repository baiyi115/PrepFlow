package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionOptionVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CacheWarmUpService {

	private static final String QUESTION_DETAIL_CACHE_KEY_PREFIX = "question:detail:";

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionMapper questionOptionMapper;

	@Resource
	private Cache<String, Object> caffeineCache;

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	private final ObjectMapper objectMapper = new ObjectMapper();

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

		QueryWrapper<QuestionOption> optionQuery = new QueryWrapper<>();
		optionQuery.in("question_id", questionIds);
		optionQuery.orderByAsc("question_id");
		optionQuery.orderByAsc("sort_order");
		List<QuestionOption> options = questionOptionMapper.selectList(optionQuery);
		Map<Long, List<QuestionOption>> optionMap = options.stream()
				.collect(Collectors.groupingBy(QuestionOption::getQuestionId));

		int redisSuccessCount = 0;
		for (Question question : questions) {
			QuestionDetailVO detailVO = buildQuestionDetailVO(question, optionMap.getOrDefault(question.getId(), List.of()));
			String cacheKey = QUESTION_DETAIL_CACHE_KEY_PREFIX + question.getId();
			caffeineCache.put(cacheKey, detailVO);

			try {
				String json = objectMapper.writeValueAsString(detailVO);
				stringRedisTemplate.opsForValue().set(cacheKey, json, Duration.ofDays(1));
				redisSuccessCount++;
			} catch (Exception e) {
				log.warn("题目详情写入 Redis 缓存失败，questionId={}", question.getId(), e);
			}
		}

		long costMillis = System.currentTimeMillis() - startTime;
		log.info("题目详情缓存预热完成：启用题目数={}，Redis写入成功={}，耗时={}ms", questions.size(), redisSuccessCount, costMillis);
	}

	private QuestionDetailVO buildQuestionDetailVO(Question question, List<QuestionOption> options) {
		List<QuestionOptionVO> optionVOList = options.stream()
				.map(this::buildQuestionOptionVO)
				.toList();

		QuestionDetailVO questionDetailVO = new QuestionDetailVO();
		questionDetailVO.setId(question.getId());
		questionDetailVO.setTitle(question.getTitle());
		questionDetailVO.setContent(question.getContent());
		questionDetailVO.setCategory(question.getCategory());
		questionDetailVO.setDifficulty(question.getDifficulty());
		questionDetailVO.setQuestionType(question.getQuestionType());
		questionDetailVO.setOptions(optionVOList);
		return questionDetailVO;
	}

	private QuestionOptionVO buildQuestionOptionVO(QuestionOption option) {
		QuestionOptionVO optionVO = new QuestionOptionVO();
		optionVO.setOptionLabel(option.getOptionLabel());
		optionVO.setOptionContent(option.getOptionContent());
		optionVO.setSortOrder(option.getSortOrder());
		return optionVO;
	}
}
