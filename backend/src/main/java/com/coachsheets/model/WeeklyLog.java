package com.coachsheets.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLog {
    private String id = UUID.randomUUID().toString();
    private Integer weekNumber;
    private String date = "";
    private String notes = "";
    private String createdBy = "";
    private String createdAt = Instant.now().toString();
}
