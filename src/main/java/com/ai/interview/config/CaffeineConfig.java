package com.ai.interview.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableAsync
public class CaffeineConfig {

	@Bean
	public Cache<String, Object> caffeineCache() {
		return Caffeine.newBuilder()
				.initialCapacity(100)
				.maximumSize(1000)
				.expireAfterWrite(5, TimeUnit.MINUTES)
				.build();
	}

	@Bean("aiTaskExecutor")
	public ThreadPoolTaskExecutor aiTaskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(4);
		executor.setMaxPoolSize(20);
		executor.setQueueCapacity(20);
		executor.setThreadNamePrefix("ai-worker-");
		executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
		executor.setWaitForTasksToCompleteOnShutdown(true);
		executor.setAwaitTerminationSeconds(30);
		executor.initialize();
		return executor;
	}
}
