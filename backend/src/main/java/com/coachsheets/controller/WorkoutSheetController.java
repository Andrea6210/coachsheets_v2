package com.coachsheets.controller;

import com.coachsheets.dto.CreateSheetRequest;
import com.coachsheets.dto.DuplicateSheetRequest;
import com.coachsheets.dto.UpdateSheetRequest;
import com.coachsheets.model.User;
import com.coachsheets.model.WorkoutSheet;
import com.coachsheets.service.WorkoutSheetService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sheets")
public class WorkoutSheetController {
    
    private final WorkoutSheetService sheetService;
    
    public WorkoutSheetController(WorkoutSheetService sheetService) {
        this.sheetService = sheetService;
    }
    
    @PostMapping
    public WorkoutSheet createSheet(@AuthenticationPrincipal User user,
                                     @RequestBody CreateSheetRequest request) {
        return sheetService.createSheet(user, request);
    }
    
    @GetMapping
    public List<WorkoutSheet> getSheets(@AuthenticationPrincipal User user) {
        return sheetService.getSheets(user);
    }
    
    @GetMapping("/archived")
    public List<WorkoutSheet> getArchivedSheets(@AuthenticationPrincipal User user) {
        return sheetService.getArchivedSheets(user);
    }
    
    @GetMapping("/{sheetId}")
    public WorkoutSheet getSheet(@AuthenticationPrincipal User user,
                                  @PathVariable String sheetId) {
        return sheetService.getSheet(user, sheetId);
    }
    
    @PutMapping("/{sheetId}")
    public WorkoutSheet updateSheet(@AuthenticationPrincipal User user,
                                     @PathVariable String sheetId,
                                     @RequestBody UpdateSheetRequest request) {
        return sheetService.updateSheet(user, sheetId, request);
    }
    
    @DeleteMapping("/{sheetId}")
    public Map<String, String> deleteSheet(@AuthenticationPrincipal User user,
                                            @PathVariable String sheetId) {
        sheetService.deleteSheet(user, sheetId);
        return Map.of("message", "Sheet deleted");
    }
    
    @PostMapping("/{sheetId}/duplicate")
    public WorkoutSheet duplicateSheet(@AuthenticationPrincipal User user,
                                        @PathVariable String sheetId,
                                        @RequestBody DuplicateSheetRequest request) {
        return sheetService.duplicateSheet(user, sheetId, request.getAthleteIds());
    }
}
