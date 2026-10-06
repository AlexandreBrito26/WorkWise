package com.workwise.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByStatus(Status status);
    List<Candidate> findByStatusInAndFeedbackSentAtIsNull(List<Status> statuses);
}
