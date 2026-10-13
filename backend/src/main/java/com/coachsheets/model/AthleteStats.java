package com.coachsheets.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "athlete_stats")
public class AthleteStats {
    @Id
    @Column(name = "athlete_id", length = 36)
    private String athleteId;
    
    private Double weight;
    private Double height;
    private Integer age;
    
    @Column(length = 20)
    private String gender;
    
    @com.fasterxml.jackson.annotation.JsonProperty("experience_level")
    @com.fasterxml.jackson.annotation.JsonAlias({"experienceLevel", "experience_level"})
    @Column(name = "experience_level", length = 20)
    private String experienceLevel;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @com.fasterxml.jackson.annotation.JsonProperty("body_fat_percentage")
    @com.fasterxml.jackson.annotation.JsonAlias({"bodyFatPercentage", "body_fat_percentage"})
    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;
    
    @com.fasterxml.jackson.annotation.JsonProperty("muscle_mass")
    @com.fasterxml.jackson.annotation.JsonAlias({"muscleMass", "muscle_mass"})
    @Column(name = "muscle_mass")
    private Double muscleMass;
    
    @com.fasterxml.jackson.annotation.JsonProperty("primary_goal")
    @com.fasterxml.jackson.annotation.JsonAlias({"primaryGoal", "primary_goal"})
    @Column(name = "primary_goal", length = 50)
    private String primaryGoal;
    
    @com.fasterxml.jackson.annotation.JsonProperty("secondary_goal")
    @com.fasterxml.jackson.annotation.JsonAlias({"secondaryGoal", "secondary_goal"})
    @Column(name = "secondary_goal", length = 50)
    private String secondaryGoal;
    
    @Column(columnDefinition = "TEXT")
    private String injuries;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;
    
    @com.fasterxml.jackson.annotation.JsonProperty("medical_notes")
    @com.fasterxml.jackson.annotation.JsonAlias({"medicalNotes", "medical_notes"})
    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;
    
    @com.fasterxml.jackson.annotation.JsonProperty("personal_records")
    @com.fasterxml.jackson.annotation.JsonAlias({"personalRecords", "personal_records"})
    @Type(JsonType.class)
    @Column(name = "personal_records", columnDefinition = "json")
    private List<PersonalRecord> personalRecords = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<Achievement> achievements = new ArrayList<>();
    
    @com.fasterxml.jackson.annotation.JsonProperty("measurement_history")
    @com.fasterxml.jackson.annotation.JsonAlias({"measurementHistory", "measurement_history"})
    @Type(JsonType.class)
    @Column(name = "measurement_history", columnDefinition = "json")
    private List<BodyMeasurement> measurementHistory = new ArrayList<>();
    
    @com.fasterxml.jackson.annotation.JsonProperty("updated_at")
    @com.fasterxml.jackson.annotation.JsonAlias({"updatedAt", "updated_at"})
    @Column(name = "updated_at")
    private String updatedAt;

    
    public void touch() {
        this.updatedAt = Instant.now().toString();
    }
}
