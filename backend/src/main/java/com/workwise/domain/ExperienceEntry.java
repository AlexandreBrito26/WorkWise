package com.workwise.domain;

import jakarta.persistence.Embeddable;

@Embeddable
public record ExperienceEntry(String company, String title, String period) {}
