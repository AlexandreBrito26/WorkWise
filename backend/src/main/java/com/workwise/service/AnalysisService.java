package com.workwise.service;

import com.workwise.domain.Candidate;

public interface AnalysisService {
    /** Lança AiException se não conseguir analisar; o candidato continua NEW e é tentado de novo no próximo ciclo. */
    Analysis analyze(Candidate candidate);
}
