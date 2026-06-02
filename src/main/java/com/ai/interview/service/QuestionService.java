package com.ai.interview.service;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.vo.QuestionDetailVO;
import com.ai.interview.vo.QuestionOptionVO;
import com.ai.interview.vo.QuestionVO;
import com.ai.interview.constant.BusinessConstant;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

	@Resource
	private QuestionMapper questionMapper;

	@Resource
	private QuestionOptionMapper questionOptionMapper;

	@Resource
	private Cache<String, Object> caffeineCache;

	@Resource
	private StringRedisTemplate stringRedisTemplate;

	private final ObjectMapper objectMapper = new ObjectMapper();

	public QuestionDetailVO getQuestionDetail(Long questionId) {
		if (questionId == null || questionId <= 0) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "题目ID不合法");
		}

		String cacheKey = "question:detail:" + questionId;

		QuestionDetailVO l1Cache = (QuestionDetailVO) caffeineCache.getIfPresent(cacheKey);
		if (l1Cache != null){
			return l1Cache;
		}

		String l2CacheJson = stringRedisTemplate.opsForValue().get(cacheKey);
		if (l2CacheJson != null && !l2CacheJson.trim().isEmpty()){
			try{
				QuestionDetailVO l2cache = objectMapper.readValue(l2CacheJson,QuestionDetailVO.class);
				caffeineCache.put(cacheKey,l2cache);
				return l2cache;
			}catch (Exception e){
				System.err.println("解析L2缓存失败："+ e.getMessage());
			}
		}

		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}
		if (!Integer.valueOf(BusinessConstant.QUESTION_STATUS_ENABLED).equals(question.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "题目已禁用");
		}
		QueryWrapper<QuestionOption> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("question_id", questionId);
		queryWrapper.orderByAsc("sort_order");

		List<QuestionOption> questionOptions = questionOptionMapper.selectList(queryWrapper);
		List<QuestionOptionVO> optionVOList = new ArrayList<>();

		for (QuestionOption option : questionOptions) {
			QuestionOptionVO optionVO = new QuestionOptionVO();
			optionVO.setOptionLabel(option.getOptionLabel());
			optionVO.setOptionContent(option.getOptionContent());
			optionVO.setSortOrder(option.getSortOrder());
			optionVOList.add(optionVO);
		}
		QuestionDetailVO questionDetailVO = new QuestionDetailVO();
		questionDetailVO.setId(question.getId());
		questionDetailVO.setTitle(question.getTitle());
		questionDetailVO.setContent(question.getContent());
		questionDetailVO.setCategory(question.getCategory());
		questionDetailVO.setDifficulty(question.getDifficulty());
		questionDetailVO.setQuestionType(question.getQuestionType());
		questionDetailVO.setOptions(optionVOList);

		try {
			String json = objectMapper.writeValueAsString(questionDetailVO);
			stringRedisTemplate.opsForValue().set(cacheKey, json, Duration.ofDays(1));
			caffeineCache.put(cacheKey, questionDetailVO);
		} catch (Exception e) {
			System.err.println("写入多级缓存失败: " + e.getMessage());
		}

		return questionDetailVO;
	}

	public List<QuestionVO> listQuestions() {
		QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("status", BusinessConstant.QUESTION_STATUS_ENABLED);
		List<Question> questionList = questionMapper.selectList(queryWrapper);
		List<QuestionVO> questionVOList = new ArrayList<>();
		for (Question question : questionList){
			QuestionVO questionVO = new QuestionVO();
			questionVO.setId(question.getId());
			questionVO.setTitle(question.getTitle());
			questionVO.setCategory(question.getCategory());
			questionVO.setDifficulty(question.getDifficulty());
			questionVO.setQuestionType(question.getQuestionType());
			questionVOList.add(questionVO);
		}
		return questionVOList;
	}
}
