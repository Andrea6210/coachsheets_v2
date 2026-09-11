package com.coachsheets.service;

import com.coachsheets.dto.LoginRequest;
import com.coachsheets.dto.RegisterRequest;
import com.coachsheets.dto.TokenResponse;
import com.coachsheets.dto.UserResponse;
import com.coachsheets.model.User;
import com.coachsheets.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        
        User user = User.create(
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getName(),
            request.getRole()
        );
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getId(), user.getRole(), user.getName());
        return new TokenResponse(token, UserResponse.fromUser(user));
    }
    
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getId(), user.getRole(), user.getName());
        return new TokenResponse(token, UserResponse.fromUser(user));
    }
}
