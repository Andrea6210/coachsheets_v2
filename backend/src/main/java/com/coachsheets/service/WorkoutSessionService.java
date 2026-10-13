package com.coachsheets.service;

import com.coachsheets.dto.SaveWorkoutSessionRequest;
import com.coachsheets.model.*;
import com.coachsheets.repository.UserRepository;
import com.coachsheets.repository.WorkoutSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public WorkoutSessionService(WorkoutSessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    private String resolveTargetAthleteId(User user, String requestedAthleteId) {
        if ("athlete".equals(user.getRole())) {
            return user.getId();
        }
        if (requestedAthleteId != null && !requestedAthleteId.isBlank()) {
            User athlete = userRepository.findById(requestedAthleteId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete not found"));
            if ("coach".equals(user.getRole()) && !user.getId().equals(athlete.getCoachId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your athlete");
            }
            return requestedAthleteId;
        }
        return user.getId();
    }

    @Transactional
    public WorkoutSession saveSession(User user, SaveWorkoutSessionRequest request) {
        String athleteId = resolveTargetAthleteId(user, request.getAthleteId());

        WorkoutSession session = new WorkoutSession();
        session.setId(UUID.randomUUID().toString());
        session.setAthleteId(athleteId);
        session.setSheetId(request.getSheetId());
        session.setProgramDayId(request.getProgramDayId());
        session.setWeekLabel(request.getWeekLabel());
        session.setDayName(request.getDayName());

        String sessionDate = request.getSessionDate();
        if (sessionDate == null || sessionDate.isBlank()) {
            sessionDate = LocalDate.now().toString();
        } else if (sessionDate.length() > 10) {
            sessionDate = sessionDate.substring(0, 10);
        }
        session.setSessionDate(sessionDate);
        session.setStartedAt(request.getStartedAt());
        session.setCompletedAt(request.getCompletedAt() != null ? request.getCompletedAt() : Instant.now().toString());
        session.setIsCompleted(true);
        session.setDayFeedbackRpe(request.getRpe());
        session.setDayFeedbackSensations(request.getGeneralNotes());
        session.setCreatedAt(Instant.now().toString());

        if (request.getExercises() != null) {
            int order = 0;
            for (SaveWorkoutSessionRequest.ExerciseSessionRequest exReq : request.getExercises()) {
                ExerciseLog exLog = new ExerciseLog();
                exLog.setId(UUID.randomUUID().toString());
                exLog.setSession(session);
                exLog.setProgramExerciseId(exReq.getExerciseId());
                exLog.setExerciseName(exReq.getName() != null ? exReq.getName() : "Esercizio");
                exLog.setOrderIndex(exReq.getOrderIndex() != null ? exReq.getOrderIndex() : order++);
                exLog.setExerciseFeedbackRpe(exReq.getRpe());
                exLog.setExerciseFeedbackNotes(exReq.getNotes());
                exLog.setAthleteVideoUrl(exReq.getVideoUrl());

                if (exReq.getSets() != null) {
                    for (SaveWorkoutSessionRequest.SetSessionRequest setReq : exReq.getSets()) {
                        SetLog setLog = new SetLog();
                        setLog.setId(UUID.randomUUID().toString());
                        setLog.setExerciseLog(exLog);
                        setLog.setSetNumber(setReq.getSetNumber() != null ? setReq.getSetNumber() : 1);
                        setLog.setActualWeight(setReq.getWeight());
                        setLog.setActualReps(setReq.getReps());
                        setLog.setActualRpe(setReq.getRpe());
                        setLog.setIsCompleted(setReq.getCompleted() != null ? setReq.getCompleted() : true);
                        setLog.setRestTakenSeconds(setReq.getRestTakenSeconds());

                        exLog.getSets().add(setLog);
                    }
                }
                session.getExerciseLogs().add(exLog);
            }
        }

        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> getSessions(User user, String requestedAthleteId) {
        String athleteId = resolveTargetAthleteId(user, requestedAthleteId);
        return sessionRepository.findByAthleteIdOrderByCreatedAtDesc(athleteId);
    }

    @Transactional
    public void deleteSession(User user, String sessionId) {
        WorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        resolveTargetAthleteId(user, session.getAthleteId());
        sessionRepository.delete(session);
    }

    /**
     * Calcola l'analisi muscolare reale basata ESCLUSIVAMENTE sulle serie e sessioni svolte.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMuscleAnalytics(User user, String requestedAthleteId) {
        String athleteId = resolveTargetAthleteId(user, requestedAthleteId);
        List<WorkoutSession> sessions = sessionRepository.findByAthleteIdOrderByCreatedAtDesc(athleteId);

        LocalDate now = LocalDate.now();

        // Gruppi standard
        String[] muscleGroups = new String[] {
            "Petto", "Dorso", "Spalle", "Quadricipiti", "Catena Posteriore", "Bicipiti", "Tricipiti", "Addome / Core", "Polpacci"
        };

        Map<String, Map<String, Object>> muscleStats = new LinkedHashMap<>();
        for (String m : muscleGroups) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("muscleGroup", m);
            stat.put("totalSets", 0);
            stat.put("totalReps", 0);
            stat.put("totalTonnage", 0.0);
            stat.put("lastTrainedDate", null);
            stat.put("recentSets7d", 0);
            stat.put("recentSets30d", 0);
            stat.put("workoutsCount", 0);
            muscleStats.put(m, stat);
        }

        int totalSessionsCompleted = sessions.size();
        double grandTotalTonnage = 0.0;
        int grandTotalCompletedSets = 0;

        for (WorkoutSession sess : sessions) {
            LocalDate sessionDate;
            try {
                sessionDate = LocalDate.parse(sess.getSessionDate());
            } catch (Exception e) {
                sessionDate = now;
            }

            long daysAgo = ChronoUnit.DAYS.between(sessionDate, now);
            Set<String> musclesInThisSession = new HashSet<>();

            if (sess.getExerciseLogs() != null) {
                for (ExerciseLog ex : sess.getExerciseLogs()) {
                    String muscle = classifyMuscle(ex.getExerciseName());
                    Map<String, Object> stat = muscleStats.computeIfAbsent(muscle, k -> {
                        Map<String, Object> s = new HashMap<>();
                        s.put("muscleGroup", k);
                        s.put("totalSets", 0);
                        s.put("totalReps", 0);
                        s.put("totalTonnage", 0.0);
                        s.put("lastTrainedDate", null);
                        s.put("recentSets7d", 0);
                        s.put("recentSets30d", 0);
                        s.put("workoutsCount", 0);
                        return s;
                    });

                    musclesInThisSession.add(muscle);

                    if (ex.getSets() != null) {
                        for (SetLog s : ex.getSets()) {
                            if (Boolean.TRUE.equals(s.getIsCompleted()) || (s.getActualReps() != null && s.getActualReps() > 0)) {
                                int sets = (int) stat.get("totalSets") + 1;
                                stat.put("totalSets", sets);
                                grandTotalCompletedSets++;

                                int reps = s.getActualReps() != null ? s.getActualReps() : 0;
                                stat.put("totalReps", (int) stat.get("totalReps") + reps);

                                double weight = s.getActualWeight() != null ? s.getActualWeight() : 0.0;
                                double tonnage = weight * reps;
                                stat.put("totalTonnage", Math.round(((double) stat.get("totalTonnage") + tonnage) * 10.0) / 10.0);
                                grandTotalTonnage += tonnage;

                                if (daysAgo <= 7) {
                                    stat.put("recentSets7d", (int) stat.get("recentSets7d") + 1);
                                }
                                if (daysAgo <= 30) {
                                    stat.put("recentSets30d", (int) stat.get("recentSets30d") + 1);
                                }

                                String lastDate = (String) stat.get("lastTrainedDate");
                                if (lastDate == null || sess.getSessionDate().compareTo(lastDate) > 0) {
                                    stat.put("lastTrainedDate", sess.getSessionDate());
                                }
                            }
                        }
                    }
                }
            }

            for (String trainedMuscle : musclesInThisSession) {
                Map<String, Object> stat = muscleStats.get(trainedMuscle);
                if (stat != null) {
                    stat.put("workoutsCount", (int) stat.get("workoutsCount") + 1);
                }
            }
        }

        // Calcola recovery status dinamico
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Map<String, Object> stat : muscleStats.values()) {
            String lastDateStr = (String) stat.get("lastTrainedDate");
            String recoveryStatus;
            int recoveryPercent;
            String badgeColor;

            if (lastDateStr == null) {
                recoveryStatus = "Pronto / Non allenato di recente";
                recoveryPercent = 100;
                badgeColor = "emerald";
            } else {
                try {
                    LocalDate ld = LocalDate.parse(lastDateStr);
                    long days = ChronoUnit.DAYS.between(ld, now);
                    if (days == 0) {
                        recoveryStatus = "Fase Acuta Recupero (Oggi)";
                        recoveryPercent = 40;
                        badgeColor = "amber";
                    } else if (days == 1) {
                        recoveryStatus = "Rigenerazione Muscolare (24h)";
                        recoveryPercent = 70;
                        badgeColor = "amber";
                    } else if (days <= 3) {
                        recoveryStatus = "Supercompensazione Ottimale";
                        recoveryPercent = 100;
                        badgeColor = "emerald";
                    } else {
                        recoveryStatus = "Completamente Recuperato";
                        recoveryPercent = 100;
                        badgeColor = "emerald";
                    }
                } catch (Exception e) {
                    recoveryStatus = "Completamente Recuperato";
                    recoveryPercent = 100;
                    badgeColor = "emerald";
                }
            }

            stat.put("recoveryStatus", recoveryStatus);
            stat.put("recoveryPercent", recoveryPercent);
            stat.put("badgeColor", badgeColor);
            resultList.add(stat);
        }

        // Ordina per tonnellaggio decrescente
        resultList.sort((a, b) -> Double.compare((double) b.get("totalTonnage"), (double) a.get("totalTonnage")));

        Map<String, Object> response = new HashMap<>();
        response.put("muscles", resultList);
        response.put("totalSessions", totalSessionsCompleted);
        response.put("grandTotalSets", grandTotalCompletedSets);
        response.put("grandTotalTonnageKg", Math.round(grandTotalTonnage * 10.0) / 10.0);
        return response;
    }

    private String classifyMuscle(String exerciseName) {
        if (exerciseName == null) return "Altro / Complementari";
        String n = exerciseName.toLowerCase().trim();

        if (n.contains("panca") || n.contains("chest") || n.contains("croci") || n.contains("dip") || n.contains("spinte manubri")) {
            return "Petto";
        }
        if (n.contains("trazioni") || n.contains("rematore") || n.contains("lat machine") || n.contains("pulley") || n.contains("dorso") || n.contains("pull down")) {
            return "Dorso";
        }
        if (n.contains("military") || n.contains("lento") || n.contains("alzate") || n.contains("shoulder") || n.contains("spalle") || n.contains("deltoid")) {
            return "Spalle";
        }
        if (n.contains("squat") || n.contains("pressa") || n.contains("leg extension") || n.contains("hack") || n.contains("affondi") || n.contains("quadricipit")) {
            return "Quadricipiti";
        }
        if (n.contains("stacco") || n.contains("leg curl") || n.contains("hip thrust") || n.contains("femorali") || n.contains("glutei") || n.contains("good morning")) {
            return "Catena Posteriore";
        }
        if (n.contains("curl") || n.contains("bicipit")) {
            return "Bicipiti";
        }
        if (n.contains("french") || n.contains("pushdown") || n.contains("tricipit") || n.contains("skull crusher")) {
            return "Tricipiti";
        }
        if (n.contains("plank") || n.contains("crunch") || n.contains("addominal") || n.contains("core") || n.contains("hollow")) {
            return "Addome / Core";
        }
        if (n.contains("calf") || n.contains("polpacci")) {
            return "Polpacci";
        }
        return "Altro / Complementari";
    }
}
