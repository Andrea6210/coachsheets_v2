package com.coachsheets.service;

import com.coachsheets.dto.CreateProgressEntryRequest;
import com.coachsheets.model.ProgressEntry;
import com.coachsheets.model.User;
import com.coachsheets.model.WorkoutSheet;
import com.coachsheets.repository.ProgressEntryRepository;
import com.coachsheets.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProgressEntryService {

    private final ProgressEntryRepository progressRepository;
    private final WorkoutSheetService sheetService;
    private final UserRepository userRepository;

    public ProgressEntryService(ProgressEntryRepository progressRepository, WorkoutSheetService sheetService,
                                 UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.sheetService = sheetService;
        this.userRepository = userRepository;
    }

    public ProgressEntry addEntry(User user, String sheetId, CreateProgressEntryRequest request) {
        WorkoutSheet sheet = sheetService.getSheet(user, sheetId); // verifica gia' l'accesso alla scheda

        String athleteId;
        if ("athlete".equals(user.getRole())) {
            // Un atleta puo' registrare solo i propri progressi
            athleteId = user.getId();
        } else {
            // Il coach deve specificare per quale atleta, se la scheda ne ha piu' di uno
            athleteId = request.getAthleteId();
            if (athleteId == null || athleteId.isBlank()) {
                if (sheet.getAthleteIds() != null && sheet.getAthleteIds().size() == 1) {
                    athleteId = sheet.getAthleteIds().get(0);
                } else {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specifica per quale atleta registrare il progresso");
                }
            }
            if (!sheet.getAthleteIds().contains(athleteId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questo atleta non e' collegato a questa scheda");
            }
        }

        if (request.getExerciseName() == null || request.getExerciseName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome esercizio richiesto");
        }

        ProgressEntry entry = ProgressEntry.create(sheetId, athleteId, request.getExerciseName().trim(),
                request.getWeekLabel(), request.getWeight(), request.getReps(), request.getDate(), user);

        return progressRepository.save(entry);
    }

    public List<ProgressEntry> getProgress(User user, String sheetId, String athleteIdFilter) {
        WorkoutSheet sheet = sheetService.getSheet(user, sheetId); // verifica accesso

        String athleteId;
        if ("athlete".equals(user.getRole())) {
            athleteId = user.getId();
        } else {
            athleteId = athleteIdFilter;
            if (athleteId == null || athleteId.isBlank()) {
                if (sheet.getAthleteIds() != null && sheet.getAthleteIds().size() == 1) {
                    athleteId = sheet.getAthleteIds().get(0);
                } else {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specifica per quale atleta vuoi vedere i progressi");
                }
            }
        }

        return progressRepository.findBySheetIdAndAthleteIdOrderByDateAsc(sheetId, athleteId);
    }

    // Progressi aggregati su TUTTE le schede dell'atleta (per la sezione dedicata),
    // non solo quelli registrati su una scheda specifica.
    public List<ProgressEntry> getAllProgressForAthlete(User user, String athleteIdParam) {
        String athleteId;
        if ("athlete".equals(user.getRole())) {
            athleteId = user.getId();
        } else {
            if (athleteIdParam == null || athleteIdParam.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specifica per quale atleta vuoi vedere i progressi");
            }
            User athlete = userRepository.findById(athleteIdParam)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atleta non trovato"));
            if (athlete.getCoachId() == null || !athlete.getCoachId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Questo atleta non è collegato al tuo account");
            }
            athleteId = athleteIdParam;
        }
        return progressRepository.findByAthleteIdOrderByDateAsc(athleteId);
    }

    public void deleteEntry(User user, String entryId) {
        ProgressEntry entry = progressRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voce non trovata"));

        // Verifica che l'utente abbia accesso alla scheda collegata
        WorkoutSheet sheet = sheetService.getSheet(user, entry.getSheetId());

        boolean isCoachOwner = "coach".equals(user.getRole()) && user.getId().equals(sheet.getCoachId());
        boolean isAuthor = user.getId().equals(entry.getLoggedBy());

        if (!isCoachOwner && !isAuthor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Non puoi eliminare questa voce");
        }

        progressRepository.deleteById(entryId);
    }
}
