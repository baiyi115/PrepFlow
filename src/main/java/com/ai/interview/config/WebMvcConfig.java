package com.ai.interview.config;

import com.ai.interview.exception.RateLimitInterceptor;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-path}")
    private String uploadPath;

    @Resource
    private RateLimitInterceptor rateLimitInterceptor;

    private File getAvatarDir() {
        File baseDir = new File(uploadPath).getAbsoluteFile();
        if (!"uploads".equalsIgnoreCase(baseDir.getName())) {
            return new File(baseDir, "uploads").getAbsoluteFile();
        }
        return baseDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = getAvatarDir().toURI().toString();

        // 将网络请求 /uploads/** 映射到本地物理路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);

        // 兼容历史上保存过的 /api/uploads/** 头像地址。
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(resourceLocation);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry){
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**");
    }
}
