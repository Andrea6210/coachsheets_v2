package com.coachsheets.service;

import com.coachsheets.model.*;
import com.coachsheets.repository.AthleteStatsRepository;
import com.coachsheets.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class AthleteStatsService {
    
    private final AthleteStatsRepository statsRepository;
    private final UserRepository userRepository;
    
    public AthleteStatsService(AthleteStatsRepository statsRepository, UserRepository userRepository) {
        this.statsRepository = statsRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Verify user has access to athlete's stats.
     * Coach can access their own athletes' stats, athlete can access own stats.
     */
    private User verifyAccess(User user, String athleteId) {
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found"));
        
        boolean hasAccess = user.getId().equals(athleteId) ||
                ("coach".equals(user.getRole()) && user.getId().equals(athlete.getCoachId()));
        
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return athlete;
    }
    
    public AthleteStats getStats(User user, String athleteId) {
        verifyAccess(user, athleteId);
        return statsRepository.findByAthleteId(athleteId)
                .orElseGet(() -> {
                    AthleteStats empty = new AthleteStats();
                    
                    empty.setAthleteId(athleteId);
                    empty.setPersonalRecords(new ArrayList<>());
                    empty.setAchievements(new ArrayList<>());
                    empty.setMeasurementHistory(new ArrayList<>());
                    return empty;
                });
    }
    
    public AthleteStats updateStats(User user, String athleteId, AthleteStats updates) {
        verifyAccess(user, athleteId);
        
        AthleteStats stats = statsRepository.findByAthleteId(athleteId)
                .orElseGet(() -> {
                    AthleteStats s = new AthleteStats();
             
                    s.setAthleteId(athleteId);
                    return s;
                });
        
        if (updates.getWeight() != null) stats.setWeight(updates.getWeight());
        if (updates.getHeight() != null) stats.setHeight(updates.getHeight());
        if (updates.getAge() != null) stats.setAge(updates.getAge());
        if (updates.getGender() != null) stats.setGender(updates.getGender());
        if (updates.getExperienceLevel() != null) stats.setExperienceLevel(updates.getExperienceLevel());
        if (updates.getBio() != null) stats.setBio(updates.getBio());
        if (updates.getBodyFatPercentage() != null) stats.setBodyFatPercentage(updates.getBodyFatPercentage());
        if (updates.getMuscleMass() != null) stats.setMuscleMass(updates.getMuscleMass());
        if (updates.getPrimaryGoal() != null) stats.setPrimaryGoal(updates.getPrimaryGoal());
        if (updates.getSecondaryGoal() != null) stats.setSecondaryGoal(updates.getSecondaryGoal());
        if (updates.getInjuries() != null) stats.setInjuries(updates.getInjuries());
        if (updates.getAllergies() != null) stats.setAllergies(updates.getAllergies());
        if (updates.getMedicalNotes() != null) stats.setMedicalNotes(updates.getMedicalNotes());
        
        stats.touch();
        return statsRepository.save(stats);
    }
    
    public PersonalRecord addPersonalRecord(User user, String athleteId, PersonalRecord pr) {
        verifyAccess(user, athleteId);
        
        AthleteStats stats = statsRepository.findByAthleteId(athleteId)
                .orElseGet(() -> {
                    AthleteStats s = new AthleteStats();
                
                    s.setAthleteId(athleteId);
                    s.setPersonalRecords(new ArrayList<>());
                    return s;
                });
        
        if (stats.getPersonalRecords() == null) {
            stats.setPersonalRecords(new ArrayList<>());
        }
        
        pr.calculateOneRepMax();
        pr.setLoggedByName(user.getName());
        pr.setLoggedByRole(user.getRole());
        stats.getPersonalRecords().add(pr);
        stats.touch();
        
        // Award achievement for first PR
        checkAndAwardPRAchievement(stats, pr.getExercise());
        
        statsRepository.save(stats);
        return pr;
    }
    
    public void deletePersonalRecord(User user, String athleteId, String prId) {
        verifyAccess(user, athleteId);
        
        AthleteStats stats = statsRepository.findByAthleteId(athleteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stats not found"));
        
        if (stats.getPersonalRecords() != null) {
            stats.getPersonalRecords().removeIf(pr -> pr.getId().equals(prId));
            stats.touch();
            statsRepository.save(stats);
        }
    }
    
    public BodyMeasurement addBodyMeasurement(User user, String athleteId, BodyMeasurement measurement) {
        verifyAccess(user, athleteId);
        
        AthleteStats stats = statsRepository.findByAthleteId(athleteId)
                .orElseGet(() -> {
                    AthleteStats s = new AthleteStats();
                
                    s.setAthleteId(athleteId);
                    s.setMeasurementHistory(new ArrayList<>());
                    return s;
                });
        
        if (stats.getMeasurementHistory() == null) {
            stats.setMeasurementHistory(new ArrayList<>());
        }
        
        stats.getMeasurementHistory().add(measurement);
        
        // Also update the current weight if provided
        if (measurement.getWeight() != null) {
            stats.setWeight(measurement.getWeight());
        }
        if (measurement.getBodyFat() != null) {
            stats.setBodyFatPercentage(measurement.getBodyFat());
        }
        
        stats.touch();
        statsRepository.save(stats);
        return measurement;
    }
    
    /**
     * Calculate 1RM using Epley formula: 1RM = weight × (1 + reps / 30)
     */
    public Double calculateOneRepMax(Double weight, Integer reps) {
        if (weight == null || reps == null || reps <= 0) return null;
        return weight * (1 + reps / 30.0);
    }
    
    private void checkAndAwardPRAchievement(AthleteStats stats, String exercise) {
        if (stats.getAchievements() == null) {
            stats.setAchievements(new ArrayList<>());
        }
        
        String type = "pr_" + exercise.toLowerCase().replaceAll("\\s+", "_");
        
        // Award "First PR" achievement if not already
        boolean hasFirstPR = stats.getAchievements().stream()
                .anyMatch(a -> "first_pr".equals(a.getType()));
        
        if (!hasFirstPR) {
            Achievement first = new Achievement();
            first.setType("first_pr");
            first.setTitle("Primo PR!");
            first.setDescription("Hai registrato il tuo primo Personal Record");
            first.setIcon("trophy");
            stats.getAchievements().add(first);
        }
        
        // Exercise-specific PR achievement
        boolean hasExercisePR = stats.getAchievements().stream()
                .anyMatch(a -> type.equals(a.getType()));
        
        if (!hasExercisePR) {
            Achievement exercisePR = new Achievement();
            exercisePR.setType(type);
            exercisePR.setTitle("PR " + exercise);
            exercisePR.setDescription("Prima registrazione PR per " + exercise);
            exercisePR.setIcon("medal");
            stats.getAchievements().add(exercisePR);
        }
    }
    
    /**
     * Get PR progression for a specific exercise (sorted by date)
     */
    public List<PersonalRecord> getPRProgression(User user, String athleteId, String exercise) {
        verifyAccess(user, athleteId);
        
        AthleteStats stats = statsRepository.findByAthleteId(athleteId).orElse(null);
        if (stats == null || stats.getPersonalRecords() == null) return List.of();
        
        return stats.getPersonalRecords().stream()
                .filter(pr -> pr.getExercise() != null && pr.getExercise().equalsIgnoreCase(exercise))
                .sorted((a, b) -> {
                    if (a.getDate() == null || b.getDate() == null) return 0;
                    return a.getDate().compareTo(b.getDate());
                })
                .toList();
    }
}
