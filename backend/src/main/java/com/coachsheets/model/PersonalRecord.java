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
    @com.fasterxml.jackson.annotation.JsonProperty("custom_value")
    @com.fasterxml.jackson.annotation.JsonAlias({"customValue", "custom_value"})
    private String customValue;

    private String date;
    private String notes;

    // Estimated 1RM using Epley formula: weight * (1 + reps/30)
    @com.fasterxml.jackson.annotation.JsonProperty("estimated_one_rep_max")
    @com.fasterxml.jackson.annotation.JsonAlias({"estimatedOneRepMax", "estimated_one_rep_max"})
    private Double estimatedOneRepMax;

    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    @com.fasterxml.jackson.annotation.JsonAlias({"createdAt", "created_at"})
    private String createdAt = Instant.now().toString();

    @com.fasterxml.jackson.annotation.JsonProperty("logged_by_name")
    @com.fasterxml.jackson.annotation.JsonAlias({"loggedByName", "logged_by_name"})
    private String loggedByName;

    @com.fasterxml.jackson.annotation.JsonProperty("logged_by_role")
    @com.fasterxml.jackson.annotation.JsonAlias({"loggedByRole", "logged_by_role"})
    private String loggedByRole;

    
    public void calculateOneRepMax() {
        if (weight != null && reps != null && reps > 0) {
            this.estimatedOneRepMax = weight * (1 + reps / 30.0);
        }
    }
}
