package com.coachsheets.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sheet_history", indexes = {
    @Index(name = "idx_sheet_id", columnList = "sheet_id"),
    @Index(name = "idx_athlete_id_hist", columnList = "athlete_id"),
    @Index(name = "idx_coach_id_hist", columnList = "coach_id")
})
public class SheetHistorySnapshot {
    @Id
    @Column(length = 36)
    private String id;
    
    @com.fasterxml.jackson.annotation.JsonProperty("sheet_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"sheetId", "sheet_id"})
    @Column(name = "sheet_id", nullable = false, length = 36)
    private String sheetId;
    
    @com.fasterxml.jackson.annotation.JsonProperty("coach_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"coachId", "coach_id"})
    @Column(name = "coach_id", nullable = false, length = 36)
    private String coachId;
    
    @com.fasterxml.jackson.annotation.JsonProperty("athlete_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"athleteId", "athlete_id"})
    @Column(name = "athlete_id", nullable = false, length = 36)
    private String athleteId;
    
    @Column(nullable = false)
    private String title;
    
    @com.fasterxml.jackson.annotation.JsonProperty("weeks_snapshot")
    @com.fasterxml.jackson.annotation.JsonAlias({"weeksSnapshot", "weeks_snapshot"})
    @Type(JsonType.class)
    @Column(name = "weeks_snapshot", columnDefinition = "json")
    private List<Week> weeksSnapshot;
    
    @com.fasterxml.jackson.annotation.JsonProperty("snapshot_at")
    @com.fasterxml.jackson.annotation.JsonAlias({"snapshotAt", "snapshot_at", "timestamp"})
    @Column(name = "snapshot_at", nullable = false)
    private String snapshotAt;
    
    @com.fasterxml.jackson.annotation.JsonProperty("reason")
    @com.fasterxml.jackson.annotation.JsonAlias({"reason", "action"})
    @Column(length = 50)
    private String reason;
    
    @com.fasterxml.jackson.annotation.JsonProperty("modified_by")
    @com.fasterxml.jackson.annotation.JsonAlias({"modifiedBy", "modified_by"})
    @Column(name = "modified_by", length = 36)
    private String modifiedBy;
    
    @com.fasterxml.jackson.annotation.JsonProperty("modified_by_name")
    @com.fasterxml.jackson.annotation.JsonAlias({"modifiedByName", "modified_by_name", "user_name", "userName"})
    @Column(name = "modified_by_name")
    private String modifiedByName;

    @com.fasterxml.jackson.annotation.JsonProperty("user_name")
    public String getUserName() {
        return modifiedByName != null ? modifiedByName : "Utente";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("action")
    public String getAction() {
        return reason != null ? reason : "update";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("timestamp")
    public String getTimestamp() {
        return snapshotAt;
    }

    
    public static SheetHistorySnapshot fromSheet(WorkoutSheet sheet, String athleteId, String reason,
                                                  String modifiedBy, String modifiedByName) {
        SheetHistorySnapshot snapshot = new SheetHistorySnapshot();
        snapshot.setId(UUID.randomUUID().toString());
        snapshot.setSheetId(sheet.getId());
        snapshot.setCoachId(sheet.getCoachId());
        snapshot.setAthleteId(athleteId);
        snapshot.setTitle(sheet.getTitle());
        snapshot.setWeeksSnapshot(sheet.getWeeks());
        snapshot.setSnapshotAt(Instant.now().toString());
        snapshot.setReason(reason);
        snapshot.setModifiedBy(modifiedBy);
        snapshot.setModifiedByName(modifiedByName);
        return snapshot;
    }
}
