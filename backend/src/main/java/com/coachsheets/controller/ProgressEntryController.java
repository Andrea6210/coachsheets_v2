package com.coachsheets.controller;

import com.coachsheets.dto.CreateProgressEntryRequest;
import com.coachsheets.model.ProgressEntry;
import com.coachsheets.model.User;
import com.coachsheets.service.ProgressEntryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sheets/{sheetId}/progress")
public class ProgressEntryController {

    private final ProgressEntryService progressService;

    public ProgressEntryController(ProgressEntryService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    public ProgressEntry addEntry(@AuthenticationPrincipal User user,
                                   @PathVariable String sheetId,
                                   @RequestBody CreateProgressEntryRequest request) {
        return progressService.addEntry(user, sheetId, request);
    }

    @GetMapping
    public List<ProgressEntry> getProgress(@AuthenticationPrincipal User user,
                                            @PathVariable String sheetId,
                                            @RequestParam(required = false) String athleteId) {
        return progressService.getProgress(user, sheetId, athleteId);
    }

    @DeleteMapping("/{entryId}")
    public Map<String, String> deleteEntry(@AuthenticationPrincipal User user,
                                            @PathVariable String sheetId,
                                            @PathVariable String entryId) {
        progressService.deleteEntry(user, entryId);
        return Map.of("message", "Entry deleted");
    }
}
