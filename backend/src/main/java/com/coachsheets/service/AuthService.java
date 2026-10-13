package com.coachsheets.service;

import com.coachsheets.dto.*;
import com.coachsheets.model.PasswordResetToken;
import com.coachsheets.model.User;
import com.coachsheets.repository.PasswordResetTokenRepository;
import com.coachsheets.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Random;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public AuthService(UserRepository userRepository, 
                       PasswordResetTokenRepository resetTokenRepository,
                       PasswordEncoder passwordEncoder, 
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
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

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nessun account trovato con questa email"));

        resetTokenRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(900000) + 100000);
        PasswordResetToken resetToken = PasswordResetToken.create(email, code, 15);
        resetTokenRepository.save(resetToken);

        return Map.of(
            "message", "Codice di recupero generato con successo (valido per 15 minuti)",
            "email", email,
            "reset_code", code
        );
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        String code = request.getToken() != null ? request.getToken().trim() : "";
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nuova password deve contenere almeno 4 caratteri");
        }

        PasswordResetToken token = resetTokenRepository.findByEmailAndToken(email, code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codice di verifica non valido o errato"));

        if (token.isExpired()) {
            resetTokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il codice di verifica è scaduto. Richiedine uno nuovo.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetTokenRepository.delete(token);

        return Map.of("message", "Password reimpostata con successo! Ora puoi accedere con la nuova password.");
    }

    public Map<String, String> changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La password attuale non è corretta");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nuova password deve contenere almeno 4 caratteri");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return Map.of("message", "Password aggiornata con successo");
    }
}
