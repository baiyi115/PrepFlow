package com.ai.interview.config;

import com.ai.interview.InterviewPlatformApplication;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.support.RetryTemplate;

@Configuration
public class AiConfig {

    @Bean
    public OpenAiApi openAiApi() {
        String baseUrl = System.getenv("AI_BASE_URL");
        String apiKey = System.getenv("AI_API_KEY");
        return OpenAiApi.builder()
                .baseUrl(baseUrl != null ? baseUrl : "https://api.deepseek.com/v1")
                .apiKey(apiKey)
                .build();
    }

    @Bean
    public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
        String modelName = System.getenv("AI_MODEL");
        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(OpenAiChatOptions.builder()
                        .model(modelName != null ? modelName : "deepseek-chat")
                        .temperature(0.7)
                        .build())
                .retryTemplate(RetryTemplate.defaultInstance())
                .build();
    }

    @Bean
    public ChatClient.Builder chatClientBuilder(OpenAiChatModel chatModel) {
        return ChatClient.builder(chatModel);
    }
}
