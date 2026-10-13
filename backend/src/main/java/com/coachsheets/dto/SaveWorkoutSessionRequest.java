package com.coachsheets.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveWorkoutSessionRequest {
    private String athleteId;
    private String sheetId;
    private String programDayId;
    private String weekLabel;
    private String dayName;
    private String sessionDate;
    private String startedAt;
    private String completedAt;
    private Integer rpe;
    private String generalNotes;
    private List<ExerciseSessionRequest> exercises;

    @Data
    public static class ExerciseSessionRequest {
        private String exerciseId;
        private String name;
        private Integer orderIndex;
        private Integer rpe;
        private String notes;
        private String videoUrl;
        private List<SetSessionRequest> sets;
    }

    @Data
    public static class SetSessionRequest {
        private Integer setNumber;
        private Double weight;
        private Integer reps;
        private Double rpe;
        private Boolean completed;
        private Integer restTakenSeconds;
    }
}
