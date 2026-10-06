package com.workwise.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Os horários vêm do application.yml (workwise.analysis.cron / workwise.feedback.cron). */
@Component
public class ScreeningJobs {
    private final ScreeningService screening;

    public ScreeningJobs(ScreeningService screening) { this.screening = screening; }

    @Scheduled(cron = "${workwise.analysis.cron}")
    public void analyzeResumes() { screening.runAnalysis(); }

    @Scheduled(cron = "${workwise.feedback.cron}")
    public void sendFeedback() { screening.sendPendingFeedback(); }
}
