package com.coachsheets.dto;

import com.coachsheets.model.Week;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class CreateSheetRequest {
    private String title;

    @JsonProperty("athlete_ids")
    @JsonAlias({"athleteIds", "athlete_ids"})
    private List<String> athleteIds;

    private List<Week> weeks;

    @JsonProperty("program_name")
    @JsonAlias({"programName", "program_name"})
    private String programName;

    @JsonProperty("week_number")
    @JsonAlias({"weekNumber", "week_number"})
    private Integer weekNumber;

    @JsonProperty("week_start")
    @JsonAlias({"weekStart", "week_start"})
    private String weekStart;
}

