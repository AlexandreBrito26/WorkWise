package com.workwise.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    NEW, REVIEW, SHORTLIST, REJECTED;

    /** O front-end usa "new", "review", "shortlist", "rejected". */
    @JsonValue
    public String json() { return name().toLowerCase(); }
}
