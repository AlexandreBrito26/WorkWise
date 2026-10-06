package com.workwise.service;

import com.workwise.domain.Candidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Por enquanto só registra no log. Depois: JavaMailSender ou outro provedor de e-mail. */
@Component
public class LoggingFeedbackSender implements FeedbackSender {
    private static final Logger log = LoggerFactory.getLogger(LoggingFeedbackSender.class);

    @Override
    public void send(Candidate c) {
        log.info("Feedback ({}) para {} <{}>", c.getStatus(), c.getName(), c.getEmail());
    }
}
