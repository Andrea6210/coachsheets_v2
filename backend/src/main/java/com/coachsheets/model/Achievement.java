package com.coachsheets.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    private String id = UUID.randomUUID().toString();
    private String type; // "first_workout", "consistency_7", "consistency_30", "pr_bench", "pr_squat", etc.
    private String title;
    private String description;
    private String icon;
    private String earnedAt = Instant.now().toString();
}
