package com.workwise.service;

import com.workwise.domain.Candidate;

public interface FeedbackSender {
    void send(Candidate candidate);
}
