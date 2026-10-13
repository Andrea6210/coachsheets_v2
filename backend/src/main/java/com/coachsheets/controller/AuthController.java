package com.coachsheets.controller;

import com.coachsheets.dto.*;
import com.coachsheets.model.User;
import com.coachsheets.service.AuthService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(@AuthenticationPrincipal User user,
                                              @RequestBody ChangePasswordRequest request) {
        return authService.changePassword(user, request);
    }
}
