package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exercise_logs", indexes = {
    @Index(name = "idx_exlog_session", columnList = "session_id")
})
public class ExerciseLog {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    @Column(name = "program_exercise_id", length = 36)
    private String programExerciseId; // Riferimento all'esercizio nel template del coach

    @Column(name = "exercise_name", nullable = false)
    private String exerciseName;
    
    @Column(name = "order_index")
    private Integer orderIndex = 0;

    // Feedback a caldo specifico per questo esercizio
    @Column(name = "exercise_feedback_rpe")
    private Integer exerciseFeedbackRpe;

    @Column(name = "exercise_feedback_notes", columnDefinition = "TEXT")
    private String exerciseFeedbackNotes;

    // Video inviato dall'atleta per il check tecnico
    @Column(name = "athlete_video_url", columnDefinition = "TEXT")
    private String athleteVideoUrl;

    @OneToMany(mappedBy = "exerciseLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SetLog> sets = new ArrayList<>();

    public static ExerciseLog create(WorkoutSession session, String programExerciseId, String exerciseName, Integer orderIndex) {
        ExerciseLog log = new ExerciseLog();
        log.setId(UUID.randomUUID().toString());
        log.setSession(session);
        log.setProgramExerciseId(programExerciseId);
        log.setExerciseName(exerciseName);
        log.setOrderIndex(orderIndex != null ? orderIndex : 0);
        return log;
    }
}
