package com.coachsheets.controller;

import com.coachsheets.model.ProgressEntry;
import com.coachsheets.model.User;
import com.coachsheets.service.ProgressEntryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressEntryService progressService;

    public ProgressController(ProgressEntryService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public List<ProgressEntry> getAllProgress(@AuthenticationPrincipal User user,
                                               @RequestParam(name = "athlete_id", required = false) String athleteIdSnake,
                                               @RequestParam(name = "athleteId", required = false) String athleteIdCamel) {
        String targetAthleteId = athleteIdSnake != null ? athleteIdSnake : athleteIdCamel;
        return progressService.getAllProgressForAthlete(user, targetAthleteId);
    }
}

