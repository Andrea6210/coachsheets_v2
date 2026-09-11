package com.coachsheets.controller;

import com.coachsheets.dto.CreateAthleteRequest;
import com.coachsheets.dto.LinkAthleteRequest;
import com.coachsheets.dto.UserResponse;
import com.coachsheets.model.User;
import com.coachsheets.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/athletes")
public class AthleteController {
    
    private final UserService userService;
    
    public AthleteController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping
    public UserResponse createAthlete(@AuthenticationPrincipal User user, 
                                       @RequestBody CreateAthleteRequest request) {
        return userService.createAthlete(user, request);
    }
    
    @PostMapping("/link")
    public UserResponse linkAthlete(@AuthenticationPrincipal User user,
                                     @RequestBody LinkAthleteRequest request) {
        return userService.linkAthlete(user, request.getEmail());
    }
    
    @GetMapping
    public List<UserResponse> getAthletes(@AuthenticationPrincipal User user) {
        return userService.getAthletes(user);
    }
    
    @DeleteMapping("/{athleteId}")
    public Map<String, String> deleteAthlete(@AuthenticationPrincipal User user, 
                                              @PathVariable String athleteId) {
        userService.deleteAthlete(user, athleteId);
        return Map.of("message", "Athlete deleted");
    }
}
