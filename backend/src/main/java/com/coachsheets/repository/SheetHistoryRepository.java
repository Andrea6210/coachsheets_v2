package com.coachsheets.repository;

import com.coachsheets.model.SheetHistorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SheetHistoryRepository extends JpaRepository<SheetHistorySnapshot, String> {
    List<SheetHistorySnapshot> findBySheetIdOrderBySnapshotAtDesc(String sheetId);
    List<SheetHistorySnapshot> findByAthleteIdOrderBySnapshotAtDesc(String athleteId);
    List<SheetHistorySnapshot> findByCoachIdOrderBySnapshotAtDesc(String coachId);
}
