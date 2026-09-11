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
    
    @Column(name = "experience_level", length = 20)
    private String experienceLevel;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;
    
    @Column(name = "muscle_mass")
    private Double muscleMass;
    
    @Column(name = "primary_goal", length = 50)
    private String primaryGoal;
    
    @Column(name = "secondary_goal", length = 50)
    private String secondaryGoal;
    
    @Column(columnDefinition = "TEXT")
    private String injuries;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;
    
    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;
    
    @Type(JsonType.class)
    @Column(name = "personal_records", columnDefinition = "json")
    private List<PersonalRecord> personalRecords = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<Achievement> achievements = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(name = "measurement_history", columnDefinition = "json")
    private List<BodyMeasurement> measurementHistory = new ArrayList<>();
    
    @Column(name = "updated_at")
    private String updatedAt;
    
    public void touch() {
        this.updatedAt = Instant.now().toString();
    }
}
