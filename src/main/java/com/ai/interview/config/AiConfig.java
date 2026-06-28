package com.ai.interview.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
@ConditionalOnProperty(name = "AI_BASE_URL")
public class AiConfig {

	@Bean
	public OpenAiApi openAiApi() {
		String baseUrl = requireEnv("AI_BASE_URL");
		String apiKey = requireEnv("AI_API_KEY");
		// RestClient timeouts apply to non-streaming calls; stream timeout is handled in AIChatService.
		ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
				.withConnectTimeout(Duration.ofSeconds(10))
				.withReadTimeout(Duration.ofSeconds(60));
		ClientHttpRequestFactory requestFactory = ClientHttpRequestFactoryBuilder.detect().build(settings);
		RestClient.Builder restClientBuilder = RestClient.builder().requestFactory(requestFactory);
		return OpenAiApi.builder()
				.baseUrl(baseUrl)
				.apiKey(apiKey)
				.restClientBuilder(restClientBuilder)
				.build();
	}

	@Bean
	public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
		String modelName = requireEnv("AI_MODEL");
		return OpenAiChatModel.builder()
				.openAiApi(openAiApi)
				.defaultOptions(OpenAiChatOptions.builder()
						.model(modelName)
						.temperature(0.7)
						.build())
				.retryTemplate(RetryTemplate.defaultInstance())
				.build();
	}

	@Bean
	public ChatClient.Builder chatClientBuilder(OpenAiChatModel chatModel) {
		return ChatClient.builder(chatModel);
	}

	private static String requireEnv(String name) {
		String value = System.getenv(name);
		if (value == null || value.isBlank()) {
			throw new IllegalStateException(name + " environment variable is required");
		}
		return value.trim();
	}
}
