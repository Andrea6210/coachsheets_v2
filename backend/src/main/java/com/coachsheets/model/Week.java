package com.coachsheets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Week {
    private String id = UUID.randomUUID().toString();
    private Integer weekNumber = 1;
    private String label = "Settimana 1";
    private List<WorkoutDay> days = new ArrayList<>();
}
