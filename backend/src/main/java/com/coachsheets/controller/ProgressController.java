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
                                               @RequestParam(required = false) String athleteId) {
        return progressService.getAllProgressForAthlete(user, athleteId);
    }
}
