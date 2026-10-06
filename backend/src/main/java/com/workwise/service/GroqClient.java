package com.workwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.workwise.config.GroqProperties;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Cliente fino da API do Groq (compatível com OpenAI). Só existe se GROQ_API_KEY estiver definida. */
@Component
@ConditionalOnExpression("!'${workwise.groq.api-key:}'.isEmpty()")
public class GroqClient {
    private final RestClient http;
    private final String model;

    public GroqClient(GroqProperties props, RestClient.Builder builder) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(props.timeout());
        factory.setReadTimeout(props.timeout());
        this.model = props.model();
        this.http = builder
                .requestFactory(factory)
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + props.apiKey())
                .build();
    }

    public record Message(String role, String content) {
        public static Message system(String c) { return new Message("system", c); }
        public static Message user(String c) { return new Message("user", c); }
    }

    /** Retorna o texto da primeira escolha. Com json=true força resposta em objeto JSON. */
    public String chat(List<Message> messages, boolean json) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", json ? 0.1 : 0.4);
        if (json) body.put("response_format", Map.of("type", "json_object"));
        try {
            JsonNode res = http.post().uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String text = res == null ? "" : res.at("/choices/0/message/content").asText("");
            if (text.isBlank()) throw new AiException("Resposta vazia do Groq");
            return text;
        } catch (RestClientException e) {
            // Inclui 401 (chave inválida), 429 (limite de uso) e erros de rede.
            throw new AiException("Falha ao chamar o Groq: " + e.getMessage(), e);
        }
    }
}
