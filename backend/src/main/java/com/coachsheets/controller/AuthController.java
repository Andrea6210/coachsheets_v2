package com.coachsheets.controller;

import com.coachsheets.dto.LoginRequest;
import com.coachsheets.dto.RegisterRequest;
import com.coachsheets.dto.TokenResponse;
import com.coachsheets.dto.UserResponse;
import com.coachsheets.model.User;
import com.coachsheets.service.AuthService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public TokenResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    
    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
    
    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal User user) {
        return UserResponse.fromUser(user);
    }
}
