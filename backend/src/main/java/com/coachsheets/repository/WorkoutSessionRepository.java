package com.coachsheets.repository;

import com.coachsheets.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, String> {
    List<WorkoutSession> findByAthleteIdAndSheetIdOrderBySessionDateDesc(String athleteId, String sheetId);
    Optional<WorkoutSession> findTopByAthleteIdAndProgramDayIdAndIsCompletedFalse(String athleteId, String programDayId);
}
