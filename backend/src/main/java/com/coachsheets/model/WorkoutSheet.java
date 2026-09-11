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
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workout_sheets")
public class WorkoutSheet {
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "coach_id", nullable = false, length = 36)
    private String coachId;
    
    @Type(JsonType.class)
    @Column(name = "athlete_ids", columnDefinition = "json")
    private List<String> athleteIds = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<Week> weeks = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false)
    private String createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private String updatedAt;
    
    @Column(name = "last_modified_by", length = 36)
    private String lastModifiedBy;
    
    @Column(name = "last_modified_by_name")
    private String lastModifiedByName;
    
    @Column(nullable = false)
    private Boolean archived = false;
    
    @Column(name = "week_start")
    private String weekStart;
    
    @Column(name = "program_name")
    private String programName;
    
    @Column(name = "week_number")
    private Integer weekNumber;
    
    public static WorkoutSheet create(String title, String coachId, List<String> athleteIds) {
        WorkoutSheet sheet = new WorkoutSheet();
        sheet.setId(UUID.randomUUID().toString());
        sheet.setTitle(title);
        sheet.setCoachId(coachId);
        sheet.setAthleteIds(athleteIds != null ? athleteIds : new ArrayList<>());
        String now = Instant.now().toString();
        sheet.setCreatedAt(now);
        sheet.setUpdatedAt(now);
        sheet.setArchived(false);
        return sheet;
    }
}
