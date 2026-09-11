package com.coachsheets.controller;

import com.coachsheets.model.AthleteStats;
import com.coachsheets.model.BodyMeasurement;
import com.coachsheets.model.PersonalRecord;
import com.coachsheets.model.User;
import com.coachsheets.service.AthleteStatsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/athletes/{athleteId}/stats")
public class AthleteStatsController {
    
    private final AthleteStatsService statsService;
    
    public AthleteStatsController(AthleteStatsService statsService) {
        this.statsService = statsService;
    }
    
    @GetMapping
    public AthleteStats getStats(@AuthenticationPrincipal User user,
                                  @PathVariable String athleteId) {
        return statsService.getStats(user, athleteId);
    }
    
    @PutMapping
    public AthleteStats updateStats(@AuthenticationPrincipal User user,
                                     @PathVariable String athleteId,
                                     @RequestBody AthleteStats updates) {
        return statsService.updateStats(user, athleteId, updates);
    }
    
    @PostMapping("/records")
    public PersonalRecord addPersonalRecord(@AuthenticationPrincipal User user,
                                             @PathVariable String athleteId,
                                             @RequestBody PersonalRecord pr) {
        return statsService.addPersonalRecord(user, athleteId, pr);
    }
    
    @DeleteMapping("/records/{prId}")
    public Map<String, String> deletePersonalRecord(@AuthenticationPrincipal User user,
                                                     @PathVariable String athleteId,
                                                     @PathVariable String prId) {
        statsService.deletePersonalRecord(user, athleteId, prId);
        return Map.of("message", "Personal record deleted");
    }
    
    @GetMapping("/records/{exercise}/progression")
    public List<PersonalRecord> getPRProgression(@AuthenticationPrincipal User user,
                                                  @PathVariable String athleteId,
                                                  @PathVariable String exercise) {
        return statsService.getPRProgression(user, athleteId, exercise);
    }
    
    @PostMapping("/measurements")
    public BodyMeasurement addBodyMeasurement(@AuthenticationPrincipal User user,
                                               @PathVariable String athleteId,
                                               @RequestBody BodyMeasurement measurement) {
        return statsService.addBodyMeasurement(user, athleteId, measurement);
    }
    
    @GetMapping("/one-rep-max")
    public Map<String, Double> calculateOneRepMax(@RequestParam Double weight,
                                                   @RequestParam Integer reps) {
        Double oneRM = statsService.calculateOneRepMax(weight, reps);
        return Map.of("estimated1RM", oneRM != null ? oneRM : 0.0);
    }
}
