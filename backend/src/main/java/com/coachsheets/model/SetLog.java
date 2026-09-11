package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "set_logs")
public class SetLog {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_log_id", nullable = false)
    private ExerciseLog exerciseLog;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "actual_weight")
    private Double actualWeight;

    @Column(name = "actual_reps")
    private Integer actualReps;
    
    @Column(name = "actual_rpe")
    private Double actualRpe;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    // Utile per sapere quanto l'atleta ha effettivamente recuperato
    @Column(name = "rest_taken_seconds")
    private Integer restTakenSeconds;

    public static SetLog create(ExerciseLog exerciseLog, Integer setNumber) {
        SetLog set = new SetLog();
        set.setId(UUID.randomUUID().toString());
        set.setExerciseLog(exerciseLog);
        set.setSetNumber(setNumber);
        set.setIsCompleted(false);
        return set;
    }
}
