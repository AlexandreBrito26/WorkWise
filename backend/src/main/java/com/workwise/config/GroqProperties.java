package com.workwise.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "workwise.groq")
public record GroqProperties(
        String apiKey,
        @DefaultValue("llama-3.3-70b-versatile") String model,
        @DefaultValue("https://api.groq.com/openai/v1") String baseUrl,
        @DefaultValue("30s") Duration timeout) {}
