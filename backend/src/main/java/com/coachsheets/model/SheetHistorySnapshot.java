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
    
    @Column(name = "sheet_id", nullable = false, length = 36)
    private String sheetId;
    
    @Column(name = "coach_id", nullable = false, length = 36)
    private String coachId;
    
    @Column(name = "athlete_id", nullable = false, length = 36)
    private String athleteId;
    
    @Column(nullable = false)
    private String title;
    
    @Type(JsonType.class)
    @Column(name = "weeks_snapshot", columnDefinition = "json")
    private List<Week> weeksSnapshot;
    
    @Column(name = "snapshot_at", nullable = false)
    private String snapshotAt;
    
    @Column(length = 50)
    private String reason;
    
    @Column(name = "modified_by", length = 36)
    private String modifiedBy;
    
    @Column(name = "modified_by_name")
    private String modifiedByName;
    
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
