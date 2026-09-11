package com.coachsheets.service;

import com.coachsheets.dto.CreateAthleteRequest;
import com.coachsheets.dto.UserResponse;
import com.coachsheets.model.User;
import com.coachsheets.model.WorkoutSheet;
import com.coachsheets.repository.AthleteStatsRepository;
import com.coachsheets.repository.UserRepository;
import com.coachsheets.repository.WorkoutSheetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final WorkoutSheetRepository sheetRepository;
    private final AthleteStatsRepository statsRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, 
                       WorkoutSheetRepository sheetRepository,
                       AthleteStatsRepository statsRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sheetRepository = sheetRepository;
        this.statsRepository = statsRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public UserResponse createAthlete(User coach, CreateAthleteRequest request) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can create athletes");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        
        User athlete = User.create(
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getName(),
            "athlete"
        );
        athlete.setCoachId(coach.getId());
        userRepository.save(athlete);
        
        return UserResponse.fromUser(athlete);
    }
    
    public List<UserResponse> getAthletes(User coach) {
        if (!"coach".equals(coach.getRole())) {
            return List.of();
        }
        return userRepository.findByCoachId(coach.getId()).stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
    
    public UserResponse linkAthlete(User coach, String email) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can link athletes");
        }
        
        User athlete = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nessun utente registrato con questa email"));
        
        if (!"athlete".equals(athlete.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Questo indirizzo email appartiene a un account coach, non atleta");
        }
        
        if (athlete.getCoachId() != null) {
            if (athlete.getCoachId().equals(coach.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Questo atleta è già collegato al tuo account");
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Questo atleta è già collegato a un altro coach");
        }
        
        athlete.setCoachId(coach.getId());
        userRepository.save(athlete);
        
        return UserResponse.fromUser(athlete);
    }
    
    @Transactional
    public void deleteAthlete(User coach, String athleteId) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can delete athletes");
        }
        
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found"));
        
        if (!coach.getId().equals(athlete.getCoachId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your athlete");
        }
        
        userRepository.deleteById(athleteId);
        statsRepository.findByAthleteId(athleteId).ifPresent(stats -> statsRepository.delete(stats));
        
        // Remove athlete from all sheets
        List<WorkoutSheet> athleteSheets = sheetRepository.findByAthleteIdsContaining(athleteId);
        for (WorkoutSheet sheet : athleteSheets) {
            sheet.getAthleteIds().remove(athleteId);
            if (sheet.getAthleteIds().isEmpty()) {
                sheetRepository.deleteById(sheet.getId());
            } else {
                sheetRepository.save(sheet);
            }
        }
    }
}
