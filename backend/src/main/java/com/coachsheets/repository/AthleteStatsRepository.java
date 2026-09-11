package com.coachsheets.repository;

import com.coachsheets.model.AthleteStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AthleteStatsRepository extends JpaRepository<AthleteStats, String> {
    Optional<AthleteStats> findByAthleteId(String athleteId);
    void deleteByAthleteId(String athleteId);
}
