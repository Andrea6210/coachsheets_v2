package com.coachsheets.repository;

import com.coachsheets.model.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, String> {
    List<ProgressEntry> findBySheetIdAndAthleteIdOrderByDateAsc(String sheetId, String athleteId);
    List<ProgressEntry> findBySheetIdAndAthleteIdAndExerciseNameOrderByDateAsc(String sheetId, String athleteId, String exerciseName);
    List<ProgressEntry> findByAthleteIdOrderByDateAsc(String athleteId);
}
