package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.UserSubmitMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AIChatService {

	private static final Duration STREAM_TIMEOUT = Duration.ofSeconds(60);
	private static final long SSE_TIMEOUT_MILLIS = 70_000L;
	private static final int MAX_MESSAGE_LENGTH = 4000;

	private final ChatClient chatClient;
	private final UserSubmitMapper userSubmitMapper;
	private final QuestionMapper questionMapper;
	private final QuestionOptionQuery questionOptionQuery;
	private final RateLimitService rateLimitService;
	private final Scheduler aiScheduler;

	public AIChatService(ChatClient.Builder builder,
						 UserSubmitMapper userSubmitMapper,
						 QuestionMapper questionMapper,
						 QuestionOptionQuery questionOptionQuery,
						 RateLimitService rateLimitService,
						 ThreadPoolTaskExecutor aiTaskExecutor) {
		this.chatClient = builder.build();
		this.userSubmitMapper = userSubmitMapper;
		this.questionMapper = questionMapper;
		this.questionOptionQuery = questionOptionQuery;
		this.rateLimitService = rateLimitService;
		this.aiScheduler = Schedulers.fromExecutor(aiTaskExecutor.getThreadPoolExecutor());
	}

	public SseEmitter streamChat(Long userId, String userMessage) {
		SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
		if (!validateChatRequest(emitter, userId, userMessage)) {
			return emitter;
		}

		AtomicReference<Disposable> disposableRef = new AtomicReference<>();
		Disposable disposable = chatClient.prompt()
				.system(AiPromptBuilder.chatSystemPrompt())
				.user(userMessage)
				.stream()
				.content()
				.timeout(STREAM_TIMEOUT)
				.subscribeOn(aiScheduler)
				.publishOn(aiScheduler)
				.subscribe(
						token -> sendToken(emitter, disposableRef, token),
						error -> sendErrorAndComplete(emitter, "AI 服务暂时不可用，请稍后再试"),
						emitter::complete
				);
		disposableRef.set(disposable);
		emitter.onCompletion(disposable::dispose);
		emitter.onTimeout(() -> {
			disposable.dispose();
			emitter.complete();
		});
		emitter.onError(error -> disposable.dispose());

		return emitter;
	}

	public SseEmitter streamDeepAnalysis(Long userId, Long submitId) {
		UserSubmit submit = getSubmit(userId, submitId);
		Question question = getQuestion(submit.getQuestionId());
		List<QuestionOption> options = questionOptionQuery.listByQuestionId(submit.getQuestionId());

		return streamChat(userId, AiPromptBuilder.deepAnalysisPrompt(question, submit, options));
	}

	private boolean validateChatRequest(SseEmitter emitter, Long userId, String userMessage) {
		if (userMessage == null || userMessage.isBlank()) {
			sendErrorAndComplete(emitter, "输入不能为空");
			return false;
		}
		if (userMessage.length() > MAX_MESSAGE_LENGTH) {
			sendErrorAndComplete(emitter, "输入内容过长");
			return false;
		}
		if (!rateLimitService.tryAcquire(userId, BusinessConstant.RATE_LIMIT_AI, 60, 10)) {
			sendErrorAndComplete(emitter, "AI 请求过于频繁，请稍后再试");
			return false;
		}
		return true;
	}

	private void sendToken(SseEmitter emitter, AtomicReference<Disposable> disposableRef, String token) {
		try {
			emitter.send(token);
		} catch (Exception e) {
			Disposable current = disposableRef.get();
			if (current != null) {
				current.dispose();
			}
			emitter.completeWithError(e);
		}
	}

	private void sendErrorAndComplete(SseEmitter emitter, String message) {
		try {
			emitter.send(SseEmitter.event().name("error").data(message));
			emitter.complete();
		} catch (Exception e) {
			emitter.complete();
		}
	}

	private UserSubmit getSubmit(Long userId, Long submitId) {
		UserSubmit submit = userSubmitMapper.selectById(submitId);
		if (submit == null || !submit.getUserId().equals(userId)) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "提交记录不存在");
		}
		return submit;
	}

	private Question getQuestion(Long questionId) {
		Question question = questionMapper.selectById(questionId);
		if (question == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
		}
		return question;
	}

}
