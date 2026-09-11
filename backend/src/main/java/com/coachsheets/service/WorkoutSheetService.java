package com.coachsheets.service;

import com.coachsheets.dto.CreateSheetRequest;
import com.coachsheets.dto.UpdateSheetRequest;
import com.coachsheets.model.SheetHistorySnapshot;
import com.coachsheets.model.User;
import com.coachsheets.model.Week;
import com.coachsheets.model.WorkoutDay;
import com.coachsheets.model.WorkoutSheet;
import com.coachsheets.repository.SheetHistoryRepository;
import com.coachsheets.repository.UserRepository;
import com.coachsheets.repository.WorkoutSheetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class WorkoutSheetService {
    
    private final WorkoutSheetRepository sheetRepository;
    private final UserRepository userRepository;
    private final SheetHistoryRepository historyRepository;
    
    public WorkoutSheetService(WorkoutSheetRepository sheetRepository, 
                                UserRepository userRepository,
                                SheetHistoryRepository historyRepository) {
        this.sheetRepository = sheetRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }
    
    public WorkoutSheet createSheet(User coach, CreateSheetRequest request) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can create sheets");
        }
        
        List<String> athleteIds = request.getAthleteIds();
        if (athleteIds == null || athleteIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one athlete required");
        }
        
        // Verify all athletes belong to this coach
        for (String athleteId : athleteIds) {
            User athlete = userRepository.findById(athleteId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found: " + athleteId));
            if (!coach.getId().equals(athlete.getCoachId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your athlete: " + athleteId);
            }
        }
        
        WorkoutSheet sheet = WorkoutSheet.create(request.getTitle(), coach.getId(), athleteIds);
        sheet.setProgramName(request.getProgramName());
        sheet.setWeekNumber(request.getWeekNumber());
        sheet.setWeekStart(request.getWeekStart());
        sheet.setLastModifiedBy(coach.getId());
        sheet.setLastModifiedByName(coach.getName());
        
        if (request.getWeeks() != null && !request.getWeeks().isEmpty()) {
            sheet.setWeeks(request.getWeeks());
        } else {
            WorkoutDay defaultDay = new WorkoutDay();
            defaultDay.setName("Giorno 1");
            Week firstWeek = new Week();
            firstWeek.setWeekNumber(1);
            firstWeek.setLabel("Settimana 1");
            firstWeek.setDays(new ArrayList<>(Collections.singletonList(defaultDay)));
            sheet.setWeeks(new ArrayList<>(Collections.singletonList(firstWeek)));
        }
        
        return sheetRepository.save(sheet);
    }
    
    public List<WorkoutSheet> getSheets(User user) {
        if ("coach".equals(user.getRole())) {
            return sheetRepository.findByCoachIdAndArchived(user.getId(), false);
        } else {
            return sheetRepository.findByAthleteIdsContainingAndArchived(user.getId(), false);
        }
    }
    
    public List<WorkoutSheet> getArchivedSheets(User user) {
        if ("coach".equals(user.getRole())) {
            return sheetRepository.findByCoachIdAndArchived(user.getId(), true);
        } else {
            return sheetRepository.findByAthleteIdsContainingAndArchived(user.getId(), true);
        }
    }
    
    public WorkoutSheet getSheet(User user, String sheetId) {
        WorkoutSheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sheet not found"));
        
        boolean hasAccess = ("coach".equals(user.getRole()) && user.getId().equals(sheet.getCoachId())) ||
                            ("athlete".equals(user.getRole()) && sheet.getAthleteIds() != null 
                                && sheet.getAthleteIds().contains(user.getId()));
        
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return sheet;
    }
    
    public WorkoutSheet updateSheet(User user, String sheetId, UpdateSheetRequest request) {
        WorkoutSheet sheet = getSheet(user, sheetId);
        
        if (request.getTitle() != null) {
            sheet.setTitle(request.getTitle());
        }
        if (request.getWeeks() != null) {
            sheet.setWeeks(request.getWeeks());
        }
        if (request.getAthleteIds() != null && "coach".equals(user.getRole())) {
            // Only coach can change athletes; verify all belong to coach
            for (String athleteId : request.getAthleteIds()) {
                User athlete = userRepository.findById(athleteId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found: " + athleteId));
                if (!user.getId().equals(athlete.getCoachId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your athlete: " + athleteId);
                }
            }
            sheet.setAthleteIds(request.getAthleteIds());
        }
        if (request.getArchived() != null && "coach".equals(user.getRole())) {
            if (Boolean.TRUE.equals(request.getArchived()) && !Boolean.TRUE.equals(sheet.getArchived())) {
                // Snapshot on archive - one per athlete
                for (String athleteId : sheet.getAthleteIds()) {
                    SheetHistorySnapshot snap = SheetHistorySnapshot.fromSheet(sheet, athleteId, "archived", 
                            user.getId(), user.getName());
                    historyRepository.save(snap);
                }
            }
            sheet.setArchived(request.getArchived());
        }
        if (request.getProgramName() != null) {
            sheet.setProgramName(request.getProgramName());
        }
        if (request.getWeekNumber() != null) {
            sheet.setWeekNumber(request.getWeekNumber());
        }
        
        sheet.setUpdatedAt(Instant.now().toString());
        sheet.setLastModifiedBy(user.getId());
        sheet.setLastModifiedByName(user.getName());
        
        return sheetRepository.save(sheet);
    }
    
    public void deleteSheet(User coach, String sheetId) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can delete sheets");
        }
        
        WorkoutSheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sheet not found"));
        
        if (!coach.getId().equals(sheet.getCoachId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your sheet");
        }
        
        sheetRepository.deleteById(sheetId);
    }
    
    public WorkoutSheet duplicateSheet(User coach, String sheetId, List<String> athleteIds) {
        if (!"coach".equals(coach.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches can duplicate sheets");
        }
        
        WorkoutSheet original = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sheet not found"));
        
        if (!coach.getId().equals(original.getCoachId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your sheet");
        }
        
        if (athleteIds == null || athleteIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one athlete required");
        }
        
        // Verify all athletes
        for (String athleteId : athleteIds) {
            User athlete = userRepository.findById(athleteId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found: " + athleteId));
            if (!coach.getId().equals(athlete.getCoachId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your athlete: " + athleteId);
            }
        }
        
        WorkoutSheet newSheet = WorkoutSheet.create(
            original.getTitle() + " (Copia)",
            coach.getId(),
            athleteIds
        );
        newSheet.setWeeks(original.getWeeks());
        newSheet.setProgramName(original.getProgramName());
        newSheet.setLastModifiedBy(coach.getId());
        newSheet.setLastModifiedByName(coach.getName());
        
        return sheetRepository.save(newSheet);
    }
}
