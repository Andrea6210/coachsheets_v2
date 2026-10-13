package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateProgressEntryRequest {
    @JsonProperty("athlete_id")
    @JsonAlias({"athleteId", "athlete_id"})
    private String athleteId;

    @JsonProperty("exercise_name")
    @JsonAlias({"exerciseName", "exercise_name"})
    private String exerciseName;

    @JsonProperty("week_label")
    @JsonAlias({"weekLabel", "week_label"})
    private String weekLabel;

    private String weight;
    private String reps;
    private String date;
}

