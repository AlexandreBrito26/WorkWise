package com.workwise.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Falha ao falar com o provedor de IA (rede, limite de uso, resposta inválida). */
@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class AiException extends RuntimeException {
    public AiException(String message) { super(message); }
    public AiException(String message, Throwable cause) { super(message, cause); }
}
