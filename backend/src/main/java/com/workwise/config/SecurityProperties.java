package com.workwise.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "workwise.security")
public record SecurityProperties(
        String jwtSecret,
        @DefaultValue("8h") Duration tokenTtl,
        String adminEmail,
        String adminPassword) {}
