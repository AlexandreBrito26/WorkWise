package com.workwise.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/** Bloqueio simples contra força bruta: 5 falhas em 15 min. Em memória, vale para uma única instância. */
@Component
public class LoginAttempts {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_KEYS = 10_000;

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public boolean isLocked(String key) {
        Deque<Instant> d = failures.get(key);
        if (d == null) return false;
        synchronized (d) { prune(d); return d.size() >= MAX_FAILURES; }
    }

    public void recordFailure(String key) {
        if (failures.size() > MAX_KEYS) failures.clear(); // evita crescer sem limite com e-mails aleatórios
        Deque<Instant> d = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (d) { prune(d); d.addLast(Instant.now()); }
    }

    public void reset(String key) { failures.remove(key); }

    private void prune(Deque<Instant> d) {
        Instant limit = Instant.now().minus(WINDOW);
        while (!d.isEmpty() && d.peekFirst().isBefore(limit)) d.removeFirst();
    }
}
