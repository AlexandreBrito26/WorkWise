package com.workwise.web;

import com.workwise.domain.*;
import java.util.List;
import jakarta.validation.constraints.*;
import java.util.Map;

/** Contrato espelhado do tipo `Candidate` em src/data.ts do front-end. */
public final class Dtos {
    private Dtos() {}

    public record SkillDto(String name, int match) {}
    public record ExperienceDto(String company, String title, String period) {}
    public record CandidateDto(String id, String name, String role, int score, Status status,
                               List<SkillDto> skills, List<ExperienceDto> experience,
                               Map<String, String> summary) {}
    public record MetricsDto(long total, int averageScore, long shortlisted, double avgDaysToFeedback) {}
    public record StatusRequest(Status status) {}

    public record CreateCandidateRequest(@NotBlank @Size(max = 120) String name,
                                         @NotBlank @Email String email,
                                         @NotBlank @Size(max = 120) String role,
                                         @NotBlank @Size(max = 20000) String resumeText) {}
    public record AssistantRequest(@NotBlank @Size(max = 1000) String message, Long candidateId) {}
    public record AssistantReply(String reply) {}
    public record LoginRequest(@NotBlank @Size(max = 254) String email, @NotBlank @Size(max = 128) String password) {}
    public record TokenResponse(String token, long expiresIn) {}

    public static CandidateDto toDto(Candidate c) {
        return new CandidateDto(
            String.valueOf(c.getId()), c.getName(), c.getRole(), c.getScore(), c.getStatus(),
            c.getSkills().stream().map(s -> new SkillDto(s.name(), s.matchPercent())).toList(),
            c.getExperience().stream().map(e -> new ExperienceDto(e.company(), e.title(), e.period())).toList(),
            Map.of("pt", nullToEmpty(c.getSummaryPt()), "en", nullToEmpty(c.getSummaryEn())));
    }

    private static String nullToEmpty(String s) { return s == null ? "" : s; }
}
