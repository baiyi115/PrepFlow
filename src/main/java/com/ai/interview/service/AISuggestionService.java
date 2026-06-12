package com.ai.interview.service;

import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.mapper.UserSubmitMapper;
import com.ai.interview.vo.WrongSubmitWithQuestionVO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AISuggestionService {

	private final ChatClient chatClient;
	private final UserSubmitMapper userSubmitMapper;
	private final RateLimitService rateLimitService;

	public AISuggestionService(ChatClient.Builder builder, UserSubmitMapper userSubmitMapper,
							   RateLimitService rateLimitService) {
		this.chatClient = builder.build();
		this.userSubmitMapper = userSubmitMapper;
		this.rateLimitService = rateLimitService;
	}

	public String generateSuggestion(Long userId, String category) {
		if (category == null || category.isBlank()) {
			return "请选择一个有效的题目分类。";
		}
		if (!rateLimitService.tryAcquire(userId, BusinessConstant.RATE_LIMIT_AI, 60, 10)) {
			return "AI 请求过于频繁，请稍后再试。";
		}

		List<WrongSubmitWithQuestionVO> wrongSubmits = userSubmitMapper.selectWrongSubmitsWithQuestion(userId, category);
		if (wrongSubmits.isEmpty()) {
			return "该分类暂无错题记录，继续加油！";
		}

		try {
			return chatClient.prompt()
					.system("你是一位资深的 Java 后端面试教练。请根据用户做错的题目，分析薄弱点并给出有针对性的学习建议。要求：1. 指出共性问题 2. 给出具体的改进方向 3. 推荐相关知识点 4. 控制在 200 字以内，使用简洁的列表格式，不要包含任何第三方称呼")
					.user(buildWrongAnswerText(wrongSubmits))
					.call()
					.content();
		} catch (Exception e) {
			return "AI 服务暂时不可用，请稍后再试。";
		}
	}

	private String buildWrongAnswerText(List<WrongSubmitWithQuestionVO> wrongSubmits) {
		StringBuilder sb = new StringBuilder();
		for (WrongSubmitWithQuestionVO item : wrongSubmits) {
			sb.append("题目：").append(nullToEmpty(item.getTitle())).append("\n");
			sb.append("内容：").append(nullToEmpty(item.getContent())).append("\n");
			sb.append("正确答案：").append(nullToEmpty(item.getCorrectOptionLabel())).append("\n");
			sb.append("你选的答案：").append(nullToEmpty(item.getSelectedOptionLabel())).append("\n");
			sb.append("解析：").append(nullToEmpty(item.getAnalysis())).append("\n");
		}
		return sb.toString();
	}

	private String nullToEmpty(String value) {
		return value != null ? value : "";
	}
}
