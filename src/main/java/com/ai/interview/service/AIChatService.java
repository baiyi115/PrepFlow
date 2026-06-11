package com.ai.interview.service;

import com.ai.interview.common.ErrorCode;
import com.ai.interview.entity.Question;
import com.ai.interview.entity.QuestionOption;
import com.ai.interview.entity.UserSubmit;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.mapper.UserSubmitMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AIChatService {

    private final ChatClient chatClient;
    private final UserSubmitMapper userSubmitMapper;
    private final QuestionMapper questionMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final Scheduler aiScheduler;

    public AIChatService(ChatClient.Builder builder,
                         UserSubmitMapper userSubmitMapper,
                         QuestionMapper questionMapper,
                         QuestionOptionMapper questionOptionMapper,
                         ThreadPoolTaskExecutor aiTaskExecutor) {
        this.chatClient = builder.build();
        this.userSubmitMapper = userSubmitMapper;
        this.questionMapper = questionMapper;
        this.questionOptionMapper = questionOptionMapper;
        this.aiScheduler = Schedulers.fromExecutor(aiTaskExecutor.getThreadPoolExecutor());
    }

    public SseEmitter streamChat(Long userId, String userMessage) {
        SseEmitter emitter = new SseEmitter(60000L);
        if (userMessage == null || userMessage.isBlank()) {
            emitter.completeWithError(new IllegalArgumentException("输入不能为空"));
            return emitter;
        }
        if (userMessage.length() > 4000) {
            emitter.completeWithError(new IllegalArgumentException("输入内容过长"));
            return emitter;
        }

        AtomicReference<Disposable> disposableRef = new AtomicReference<>();
        Disposable disposable = chatClient.prompt()
                .system("你是一位资深的 IT 面试教练，请详细解答用户的问题。回答要深入浅出，结合实际代码示例。")
                .user(userMessage)
                .stream()
                .content()
                .subscribeOn(aiScheduler)
                .publishOn(aiScheduler)
                .subscribe(
                        token -> {
                            try {
                                emitter.send(token);
                            } catch (Exception e) {
                                Disposable current = disposableRef.get();
                                if (current != null) {
                                    current.dispose();
                                }
                                emitter.completeWithError(e);
                            }
                        },
                        emitter::completeWithError,
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
        UserSubmit submit = userSubmitMapper.selectById(submitId);
        if (submit == null || !submit.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "提交记录不存在");
        }

        Question question = questionMapper.selectById(submit.getQuestionId());
        if (question == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "题目不存在");
        }

        QueryWrapper<QuestionOption> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("question_id", submit.getQuestionId());
        queryWrapper.orderByAsc("sort_order");
        List<QuestionOption> options = questionOptionMapper.selectList(queryWrapper);

        String selectedOptContent = options.stream()
                .filter(o -> o.getOptionLabel().equals(submit.getSelectedOptionLabel()))
                .findFirst()
                .map(QuestionOption::getOptionContent)
                .orElse("");

        String correctOptContent = options.stream()
                .filter(o -> o.getOptionLabel().equals(submit.getCorrectOptionLabel()))
                .findFirst()
                .map(QuestionOption::getOptionContent)
                .orElse("");

        boolean isCorrect = Integer.valueOf(1).equals(submit.getIsCorrect());

        String prompt = (isCorrect
                ? "分析这道面试题，深入总结核心知识点（控制在 200-300 字，用 3-5 个要点列出关键概念和原理，不要输出无关内容，不要包含任何第三方称呼）："
                : "分析这道面试题，指出错误原因并深入解析（控制在 200-300 字，用 3-5 个要点列出正确概念和易错点，不要输出无关内容，不要包含任何第三方称呼）：")
                + "\n题目：「" + question.getTitle() + "」"
                + (question.getContent() != null && !question.getContent().isBlank()
                ? "\n题目内容：「" + question.getContent() + "」" : "")
                + "\n你的答案：「" + submit.getSelectedOptionLabel() + ". " + selectedOptContent + "」"
                + "\n正确答案：「" + submit.getCorrectOptionLabel() + ". " + correctOptContent + "」"
                + "\n题目解析：「" + (question.getAnalysis() != null ? question.getAnalysis() : "无") + "」";

        return streamChat(userId, prompt);
    }
}
