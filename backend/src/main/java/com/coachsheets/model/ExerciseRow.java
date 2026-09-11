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
public class ExerciseRow {
    private String id = UUID.randomUUID().toString();
    private String exercise = "";
    private String sets = "";
    private String reps = "";
    private String weight = "";
    private String rest = "";
    private String notes = "";
    private String coachNotes = "";
    private String athleteNotes = "";
    private String videoUrl = "";
    private List<WeeklyLog> weeklyLogs = new ArrayList<>();
}
