package com.ai.interview.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.service.AIChatService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class AIChatController {

    private final AIChatService aiChatService;

    public AIChatController(AIChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/stream")
    public SseEmitter streamChat(@RequestBody Map<String, String> body) {
        Long userId = StpUtil.getLoginIdAsLong();
        String userMessage = body.get("message");
        return aiChatService.streamChat(userId, userMessage);
    }

    @PostMapping("/analysis/deep")
    public SseEmitter deepAnalysis(@RequestBody Map<String, Long> body) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long submitId = body.get("submitId");
        return aiChatService.streamDeepAnalysis(userId, submitId);
    }
}
