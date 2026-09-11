package com.coachsheets.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDay {
    private String id = UUID.randomUUID().toString();
    private String name = "Giorno 1";
    private List<ExerciseRow> exercises = new ArrayList<>();
    private String notes = "";
}
