package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workout_sessions", indexes = {
    @Index(name = "idx_session_athlete", columnList = "athlete_id"),
    @Index(name = "idx_session_date", columnList = "session_date")
})
public class WorkoutSession {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "athlete_id", nullable = false, length = 36)
    private String athleteId;

    @Column(name = "sheet_id", length = 36)
    private String sheetId;

    @Column(name = "program_day_id", length = 36)
    private String programDayId; // Riferimento al giorno teorico del programma

    @Column(name = "week_label")
    private String weekLabel;
    
    @Column(name = "day_name")
    private String dayName;

    @Column(name = "session_date", nullable = false)
    private String sessionDate;

    @Column(name = "started_at")
    private String startedAt;

    @Column(name = "completed_at")
    private String completedAt;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    // Feedback dell'atleta sull'intera seduta
    @Column(name = "day_feedback_rpe")
    private Integer dayFeedbackRpe;

    @Column(name = "day_feedback_sensations", columnDefinition = "TEXT")
    private String dayFeedbackSensations;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseLog> exerciseLogs = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public static WorkoutSession create(String athleteId, String sheetId, String programDayId, String weekLabel, String dayName) {
        WorkoutSession session = new WorkoutSession();
        session.setId(UUID.randomUUID().toString());
        session.setAthleteId(athleteId);
        session.setSheetId(sheetId);
        session.setProgramDayId(programDayId);
        session.setWeekLabel(weekLabel);
        session.setDayName(dayName);
        session.setSessionDate(Instant.now().toString().substring(0, 10)); // YYYY-MM-DD
        session.setCreatedAt(Instant.now().toString());
        return session;
    }
}
