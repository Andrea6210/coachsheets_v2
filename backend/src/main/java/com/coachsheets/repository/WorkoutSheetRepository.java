package com.coachsheets.repository;

import com.coachsheets.model.WorkoutSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutSheetRepository extends JpaRepository<WorkoutSheet, String> {
    List<WorkoutSheet> findByCoachId(String coachId);
    
    List<WorkoutSheet> findByCoachIdAndArchived(String coachId, Boolean archived);
    
    /**
     * Find sheets where the athleteIds JSON array contains the given athlete ID.
     * Uses MySQL/H2 JSON_CONTAINS function.
     */
    @Query(value = "SELECT * FROM workout_sheets WHERE JSON_CONTAINS(athlete_ids, JSON_QUOTE(:athleteId))", 
           nativeQuery = true)
    List<WorkoutSheet> findByAthleteIdsContaining(@Param("athleteId") String athleteId);
    
    @Query(value = "SELECT * FROM workout_sheets WHERE JSON_CONTAINS(athlete_ids, JSON_QUOTE(:athleteId)) AND archived = :archived", 
           nativeQuery = true)
    List<WorkoutSheet> findByAthleteIdsContainingAndArchived(@Param("athleteId") String athleteId, 
                                                              @Param("archived") Boolean archived);
}
