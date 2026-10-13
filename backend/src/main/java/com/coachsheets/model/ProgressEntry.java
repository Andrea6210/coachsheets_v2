package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "progress_entries", indexes = {
    @Index(name = "idx_progress_sheet", columnList = "sheet_id"),
    @Index(name = "idx_progress_athlete", columnList = "athlete_id"),
    @Index(name = "idx_progress_exercise", columnList = "exercise_name")
})
public class ProgressEntry {
    @Id
    @Column(length = 36)
    private String id;

    @com.fasterxml.jackson.annotation.JsonProperty("sheet_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"sheetId", "sheet_id"})
    @Column(name = "sheet_id", nullable = false, length = 36)
    private String sheetId;

    @com.fasterxml.jackson.annotation.JsonProperty("athlete_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"athleteId", "athlete_id"})
    @Column(name = "athlete_id", nullable = false, length = 36)
    private String athleteId;

    // Nome esercizio in chiaro (es. "Panca Piana") - collega i log tra
    // settimane diverse della stessa scheda, dato che ogni settimana ha
    // una propria copia dell'esercizio con un id diverso.
    @com.fasterxml.jackson.annotation.JsonProperty("exercise_name")
    @com.fasterxml.jackson.annotation.JsonAlias({"exerciseName", "exercise_name"})
    @Column(name = "exercise_name", nullable = false)
    private String exerciseName;

    @com.fasterxml.jackson.annotation.JsonProperty("week_label")
    @com.fasterxml.jackson.annotation.JsonAlias({"weekLabel", "week_label"})
    @Column(name = "week_label")
    private String weekLabel;

    @Column(nullable = false)
    private String weight = "";

    @Column(nullable = false)
    private String reps = "";

    @Column(nullable = false)
    private String date;

    @com.fasterxml.jackson.annotation.JsonProperty("logged_by")
    @com.fasterxml.jackson.annotation.JsonAlias({"loggedBy", "logged_by"})
    @Column(name = "logged_by", length = 36)
    private String loggedBy;

    @com.fasterxml.jackson.annotation.JsonProperty("logged_by_name")
    @com.fasterxml.jackson.annotation.JsonAlias({"loggedByName", "logged_by_name"})
    @Column(name = "logged_by_name")
    private String loggedByName;

    @com.fasterxml.jackson.annotation.JsonProperty("logged_by_role")
    @com.fasterxml.jackson.annotation.JsonAlias({"loggedByRole", "logged_by_role"})
    @Column(name = "logged_by_role", length = 20)
    private String loggedByRole;

    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    @com.fasterxml.jackson.annotation.JsonAlias({"createdAt", "created_at"})
    @Column(name = "created_at", nullable = false)
    private String createdAt;


    public static ProgressEntry create(String sheetId, String athleteId, String exerciseName, String weekLabel,
                                        String weight, String reps, String date,
                                        User loggedByUser) {
        ProgressEntry entry = new ProgressEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setSheetId(sheetId);
        entry.setAthleteId(athleteId);
        entry.setExerciseName(exerciseName);
        entry.setWeekLabel(weekLabel);
        entry.setWeight(weight != null ? weight : "");
        entry.setReps(reps != null ? reps : "");
        entry.setDate(date != null && !date.isBlank() ? date : Instant.now().toString().substring(0, 10));
        entry.setLoggedBy(loggedByUser.getId());
        entry.setLoggedByName(loggedByUser.getName());
        entry.setLoggedByRole(loggedByUser.getRole());
        entry.setCreatedAt(Instant.now().toString());
        return entry;
    }
}
