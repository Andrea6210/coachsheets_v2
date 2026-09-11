package com.coachsheets.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalRecord {
    private String id = UUID.randomUUID().toString();
    private String exercise; // "Panca Piana", "Squat", "Stacco", ma anche "5km Corsa", "Plank"...
    // Libero: "Forza", "Resistenza", "Corpo Libero", "Peso Corporeo", "Altro"
    private String category;
    private Double weight;
    private Integer reps;
    // Per record non basati su peso/reps, es. "22:30", "3 min", "45 reps a corpo libero"
    private String customValue;
    private String date;
    private String notes;
    // Estimated 1RM using Epley formula: weight * (1 + reps/30)
    private Double estimatedOneRepMax;
    private String createdAt = Instant.now().toString();
    private String loggedByName;
    private String loggedByRole;
    
    public void calculateOneRepMax() {
        if (weight != null && reps != null && reps > 0) {
            this.estimatedOneRepMax = weight * (1 + reps / 30.0);
        }
    }
}
