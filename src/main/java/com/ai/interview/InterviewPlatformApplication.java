package com.ai.interview;

import org.mybatis.spring.annotation.MapperScan;
import org.mybatis.spring.annotation.MapperScans;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.ai.interview.mapper")
public class InterviewPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewPlatformApplication.class, args);
	}

}
