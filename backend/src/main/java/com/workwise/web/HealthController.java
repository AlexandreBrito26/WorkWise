package com.workwise.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Usado pelo health check da hospedagem. Não expõe nenhum dado. */
@RestController
public class HealthController {
    @GetMapping("/api/health")
    public Map<String, String> health() { return Map.of("status", "ok"); }
}
