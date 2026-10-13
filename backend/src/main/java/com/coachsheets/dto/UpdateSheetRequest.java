package com.coachsheets.dto;

import com.coachsheets.model.Week;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UpdateSheetRequest {
    private String title;
    private List<Week> weeks;

    @JsonProperty("athlete_ids")
    @JsonAlias({"athleteIds", "athlete_ids"})
    private List<String> athleteIds;

    private Boolean archived;

    @JsonProperty("program_name")
    @JsonAlias({"programName", "program_name"})
    private String programName;

    @JsonProperty("week_number")
    @JsonAlias({"weekNumber", "week_number"})
    private Integer weekNumber;
}

