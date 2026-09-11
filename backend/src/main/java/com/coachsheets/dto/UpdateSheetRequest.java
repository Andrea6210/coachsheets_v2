package com.coachsheets.dto;

import com.coachsheets.model.Week;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UpdateSheetRequest {
    private String title;
    private List<Week> weeks;
    private List<String> athleteIds;
    private Boolean archived;
    private String programName;
    private Integer weekNumber;
}
