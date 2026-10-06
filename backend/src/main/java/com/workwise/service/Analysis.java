package com.workwise.service;

import com.workwise.domain.SkillEntry;
import java.util.List;

/** Resultado de uma análise, venha ela de regras ou de IA. */
public record Analysis(int score, String summaryPt, String summaryEn, List<SkillEntry> skills) {}
