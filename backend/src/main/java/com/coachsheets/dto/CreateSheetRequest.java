package com.coachsheets.dto;

import com.coachsheets.model.Week;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class CreateSheetRequest {
    private String title;
    private List<String> athleteIds;
    private List<Week> weeks;
    private String programName;
    private Integer weekNumber;
    private String weekStart;
}
