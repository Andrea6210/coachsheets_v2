package com.coachsheets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateProgressEntryRequest {
    private String athleteId;
    private String exerciseName;
    private String weekLabel;
    private String weight;
    private String reps;
    private String date;
}
