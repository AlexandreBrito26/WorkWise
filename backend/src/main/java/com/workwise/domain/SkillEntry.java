package com.workwise.domain;

import jakarta.persistence.Embeddable;

@Embeddable
public record SkillEntry(String name, int matchPercent) {}
