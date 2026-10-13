package com.coachsheets.controller;

import com.coachsheets.dto.SaveWorkoutSessionRequest;
import com.coachsheets.model.User;
import com.coachsheets.model.WorkoutSession;
import com.coachsheets.service.WorkoutSessionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @PostMapping
    public WorkoutSession saveSession(@AuthenticationPrincipal User user,
                                      @RequestBody SaveWorkoutSessionRequest request) {
        return workoutSessionService.saveSession(user, request);
    }

    @GetMapping
    public List<WorkoutSession> getSessions(@AuthenticationPrincipal User user,
                                            @RequestParam(required = false) String athleteId) {
        return workoutSessionService.getSessions(user, athleteId);
    }

    @GetMapping("/analytics")
    public Map<String, Object> getMuscleAnalytics(@AuthenticationPrincipal User user,
                                                  @RequestParam(required = false) String athleteId) {
        return workoutSessionService.getMuscleAnalytics(user, athleteId);
    }

    @DeleteMapping("/{sessionId}")
    public Map<String, String> deleteSession(@AuthenticationPrincipal User user,
                                             @PathVariable String sessionId) {
        workoutSessionService.deleteSession(user, sessionId);
        return Map.of("message", "Session deleted successfully");
    }
}
