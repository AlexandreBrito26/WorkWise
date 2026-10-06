package com.workwise.service;

import com.workwise.domain.*;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScreeningService {
    private static final Logger log = LoggerFactory.getLogger(ScreeningService.class);
    static final int SHORTLIST_MIN = 80;
    static final int REJECT_BELOW = 60;

    private final CandidateRepository repo;
    private final AnalysisService analysis;
    private final FeedbackSender feedback;
    private final boolean autoReject;

    public ScreeningService(CandidateRepository repo, AnalysisService analysis, FeedbackSender feedback,
                            @Value("${workwise.screening.auto-reject:false}") boolean autoReject) {
        this.repo = repo;
        this.analysis = analysis;
        this.feedback = feedback;
        this.autoReject = autoReject;
    }

    /** Analisa candidatos novos. Falhas (ex.: limite do Groq) deixam o candidato como NEW para a próxima rodada. */
    @Transactional
    public int runAnalysis() {
        int done = 0;
        for (Candidate c : repo.findByStatus(Status.NEW)) {
            try {
                apply(c, analysis.analyze(c));
                done++;
            } catch (AiException e) {
                log.warn("Análise adiada para o candidato {}: {}", c.getId(), e.getMessage());
            }
        }
        log.info("Análise concluída: {} candidato(s)", done);
        return done;
    }

    private void apply(Candidate c, Analysis a) {
        c.setScore(a.score());
        if (a.summaryPt() != null && !a.summaryPt().isBlank()) c.setSummaryPt(a.summaryPt());
        if (a.summaryEn() != null && !a.summaryEn().isBlank()) c.setSummaryEn(a.summaryEn());
        if (a.skills() != null && !a.skills().isEmpty()) c.setSkills(new ArrayList<>(a.skills()));
        c.setAnalyzedAt(Instant.now());
        // Recusa é decisão humana, a menos que workwise.screening.auto-reject=true.
        if (a.score() >= SHORTLIST_MIN) c.setStatus(Status.SHORTLIST);
        else if (a.score() < REJECT_BELOW && autoReject) c.setStatus(Status.REJECTED);
        else c.setStatus(Status.REVIEW);
    }

    /** Envia feedback para quem já tem decisão e ainda não recebeu. */
    @Transactional
    public int sendPendingFeedback() {
        List<Candidate> due = repo.findByStatusInAndFeedbackSentAtIsNull(List.of(Status.SHORTLIST, Status.REJECTED));
        for (Candidate c : due) {
            feedback.send(c);
            c.setFeedbackSentAt(Instant.now());
        }
        log.info("Feedback enviado: {} candidato(s)", due.size());
        return due.size();
    }

    @Transactional(readOnly = true)
    public double averageDaysToFeedback() {
        return repo.findAll().stream()
            .filter(c -> c.getFeedbackSentAt() != null)
            .mapToDouble(c -> Duration.between(c.getCreatedAt(), c.getFeedbackSentAt()).toHours() / 24.0)
            .average().orElse(0);
    }
}
