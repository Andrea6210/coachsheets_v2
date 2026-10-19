package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class SaveWorkoutSessionRequest {
    @JsonProperty("athlete_id")
    @JsonAlias({"athleteId", "athlete_id"})
    private String athleteId;

    @JsonProperty("sheet_id")
    @JsonAlias({"sheetId", "sheet_id"})
    private String sheetId;

    @JsonProperty("program_day_id")
    @JsonAlias({"programDayId", "program_day_id"})
    private String programDayId;

    @JsonProperty("week_label")
    @JsonAlias({"weekLabel", "week_label"})
    private String weekLabel;

    @JsonProperty("day_name")
    @JsonAlias({"dayName", "day_name"})
    private String dayName;

    @JsonProperty("session_date")
    @JsonAlias({"sessionDate", "session_date"})
    private String sessionDate;

    @JsonProperty("started_at")
    @JsonAlias({"startedAt", "started_at"})
    private String startedAt;

    @JsonProperty("completed_at")
    @JsonAlias({"completedAt", "completed_at"})
    private String completedAt;

    private Integer rpe;

    @JsonProperty("general_notes")
    @JsonAlias({"generalNotes", "general_notes"})
    private String generalNotes;

    private List<ExerciseSessionRequest> exercises;

    @Data
    public static class ExerciseSessionRequest {
        @JsonProperty("exercise_id")
        @JsonAlias({"exerciseId", "exercise_id"})
        private String exerciseId;

        private String name;

        @JsonProperty("order_index")
        @JsonAlias({"orderIndex", "order_index"})
        private Integer orderIndex;

        private Integer rpe;
        private String notes;

        @JsonProperty("video_url")
        @JsonAlias({"videoUrl", "video_url"})
        private String videoUrl;

        private List<SetSessionRequest> sets;
    }

    @Data
    public static class SetSessionRequest {
        @JsonProperty("set_number")
        @JsonAlias({"setNumber", "set_number"})
        private Integer setNumber;

        @JsonProperty("weight")
        @JsonAlias({"weight", "actual_weight", "actualWeight"})
        private Double weight;

        @JsonProperty("reps")
        @JsonAlias({"reps", "actual_reps", "actualReps"})
        private Integer reps;

        private Double rpe;
        private Boolean completed;

        @JsonProperty("rest_taken_seconds")
        @JsonAlias({"restTakenSeconds", "rest_taken_seconds"})
        private Integer restTakenSeconds;
    }
}
