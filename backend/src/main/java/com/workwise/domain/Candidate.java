package com.workwise.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Candidate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    @Column(name = "job_role") private String role;
    private int score;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    @Column(length = 500) private String summaryPt;
    @Column(length = 500) private String summaryEn;

    @ElementCollection(fetch = FetchType.EAGER) @OrderColumn
    private List<SkillEntry> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER) @OrderColumn
    private List<ExperienceEntry> experience = new ArrayList<>();

    @Column(length = 20000) private String resumeText;

    private Instant createdAt = Instant.now();
    private Instant analyzedAt;
    private Instant feedbackSentAt;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String v) { name = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { email = v; }
    public String getRole() { return role; }
    public void setRole(String v) { role = v; }
    public int getScore() { return score; }
    public void setScore(int v) { score = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { status = v; }
    public String getSummaryPt() { return summaryPt; }
    public void setSummaryPt(String v) { summaryPt = v; }
    public String getSummaryEn() { return summaryEn; }
    public void setSummaryEn(String v) { summaryEn = v; }
    public List<SkillEntry> getSkills() { return skills; }
    public void setSkills(List<SkillEntry> v) { skills = v; }
    public List<ExperienceEntry> getExperience() { return experience; }
    public void setExperience(List<ExperienceEntry> v) { experience = v; }
    public String getResumeText() { return resumeText; }
    public void setResumeText(String v) { resumeText = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { createdAt = v; }
    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant v) { analyzedAt = v; }
    public Instant getFeedbackSentAt() { return feedbackSentAt; }
    public void setFeedbackSentAt(Instant v) { feedbackSentAt = v; }
}
