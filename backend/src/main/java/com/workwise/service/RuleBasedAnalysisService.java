package com.workwise.service;

import com.workwise.domain.Candidate;
import com.workwise.domain.SkillEntry;
import org.springframework.stereotype.Service;

/** Plano B sem IA: média da compatibilidade das habilidades já cadastradas. */
@Service
public class RuleBasedAnalysisService implements AnalysisService {
    @Override
    public Analysis analyze(Candidate c) {
        int score = (int) Math.round(c.getSkills().stream().mapToInt(SkillEntry::matchPercent).average().orElse(0));
        return new Analysis(score, c.getSummaryPt(), c.getSummaryEn(), c.getSkills());
    }
}
