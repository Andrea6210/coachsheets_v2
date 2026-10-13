package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DuplicateSheetRequest {
    @JsonProperty("athlete_ids")
    @JsonAlias({"athleteIds", "athlete_ids"})
    private List<String> athleteIds;
}

