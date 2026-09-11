package com.coachsheets.controller;

import com.coachsheets.model.SheetHistorySnapshot;
import com.coachsheets.model.User;
import com.coachsheets.repository.SheetHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class SheetHistoryController {
    
    private final SheetHistoryRepository historyRepository;
    
    public SheetHistoryController(SheetHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }
    
    /**
     * Get history of all sheets for the current user (coach or athlete)
     */
    @GetMapping
    public List<SheetHistorySnapshot> getMyHistory(@AuthenticationPrincipal User user) {
        if ("coach".equals(user.getRole())) {
            return historyRepository.findByCoachIdOrderBySnapshotAtDesc(user.getId());
        } else {
            return historyRepository.findByAthleteIdOrderBySnapshotAtDesc(user.getId());
        }
    }
    
    /**
     * Get history of a specific athlete (Coach only)
     */
    @GetMapping("/athlete/{athleteId}")
    public List<SheetHistorySnapshot> getAthleteHistory(@AuthenticationPrincipal User user,
                                                         @PathVariable String athleteId) {
        if (!"coach".equals(user.getRole())) {
            // Athletes can only see their own history
            if (!user.getId().equals(athleteId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }
        return historyRepository.findByAthleteIdOrderBySnapshotAtDesc(athleteId);
    }
    
    /**
     * Get history of a specific sheet
     */
    @GetMapping("/sheet/{sheetId}")
    public List<SheetHistorySnapshot> getSheetHistory(@AuthenticationPrincipal User user,
                                                       @PathVariable String sheetId) {
        List<SheetHistorySnapshot> snapshots = historyRepository.findBySheetIdOrderBySnapshotAtDesc(sheetId);
        // Filter to only those the user has access to
        return snapshots.stream().filter(s -> 
            user.getId().equals(s.getCoachId()) || user.getId().equals(s.getAthleteId())
        ).toList();
    }
}
