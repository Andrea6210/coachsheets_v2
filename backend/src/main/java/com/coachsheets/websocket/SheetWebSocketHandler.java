package com.coachsheets.websocket;

import com.coachsheets.model.User;
import com.coachsheets.model.Week;
import com.coachsheets.model.WorkoutSheet;
import com.coachsheets.repository.UserRepository;
import com.coachsheets.repository.WorkoutSheetRepository;
import com.coachsheets.service.JwtService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SheetWebSocketHandler extends TextWebSocketHandler {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final WorkoutSheetRepository sheetRepository;
    private final ObjectMapper objectMapper;
    
    private final Map<String, Set<WebSocketSession>> sheetSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionSheetMap = new ConcurrentHashMap<>();
    private final Map<String, User> sessionUserMap = new ConcurrentHashMap<>();
    
    public SheetWebSocketHandler(JwtService jwtService, 
                                  UserRepository userRepository,
                                  WorkoutSheetRepository sheetRepository,
                                  ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.sheetRepository = sheetRepository;
        // Riusiamo l'ObjectMapper configurato globalmente (snake_case) invece di
        // crearne uno nuovo di default: altrimenti i messaggi WS in tempo reale
        // usavano nomi di campo diversi (es. "weeklyLogs") rispetto alle risposte
        // REST ("weekly_logs"), disallineando il frontend durante la collaborazione live.
        this.objectMapper = objectMapper;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String path = session.getUri().getPath();
        String sheetId = path.substring(path.lastIndexOf('/') + 1);
        
        String token = extractToken(session);
        if (token == null || !jwtService.validateToken(token)) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        
        String userId = jwtService.extractUserId(token);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        
        User user = userOpt.get();
        
        // Verify access
        Optional<WorkoutSheet> sheetOpt = sheetRepository.findById(sheetId);
        if (sheetOpt.isEmpty()) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        
        WorkoutSheet sheet = sheetOpt.get();
        boolean hasAccess = ("coach".equals(user.getRole()) && user.getId().equals(sheet.getCoachId())) ||
                            ("athlete".equals(user.getRole()) && sheet.getAthleteIds() != null 
                                && sheet.getAthleteIds().contains(user.getId()));
        
        if (!hasAccess) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        
        sheetSessions.computeIfAbsent(sheetId, k -> ConcurrentHashMap.newKeySet()).add(session);
        sessionSheetMap.put(session.getId(), sheetId);
        sessionUserMap.put(session.getId(), user);
        
        // Notify others
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "user_joined");
        notification.put("user_id", user.getId());
        notification.put("user_name", user.getName());
        broadcastToSheet(sheetId, notification, session);
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sheetId = sessionSheetMap.get(session.getId());
        User user = sessionUserMap.get(session.getId());
        if (sheetId == null || user == null) return;
        
        Map<String, Object> data = objectMapper.readValue(message.getPayload(), new TypeReference<>() {});
        String type = (String) data.get("type");
        
        if ("update".equals(type)) {
            // Update sheet in DB
            List<Week> weeks = objectMapper.convertValue(data.get("weeks"), new TypeReference<List<Week>>() {});
            
            Optional<WorkoutSheet> sheetOpt = sheetRepository.findById(sheetId);
            if (sheetOpt.isPresent()) {
                WorkoutSheet sheet = sheetOpt.get();
                sheet.setWeeks(weeks);
                sheet.setUpdatedAt(Instant.now().toString());
                sheet.setLastModifiedBy(user.getId());
                sheet.setLastModifiedByName(user.getName());
                sheetRepository.save(sheet);
            }
            
            Map<String, Object> broadcast = new HashMap<>();
            broadcast.put("type", "sheet_update");
            broadcast.put("weeks", weeks);
            broadcast.put("updated_by", user.getId());
            broadcast.put("updated_by_name", user.getName());
            broadcast.put("updated_at", Instant.now().toString());
            broadcastToSheet(sheetId, broadcast, session);
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sheetId = sessionSheetMap.remove(session.getId());
        User user = sessionUserMap.remove(session.getId());
        
        if (sheetId != null) {
            Set<WebSocketSession> sessions = sheetSessions.get(sheetId);
            if (sessions != null) {
                sessions.remove(session);
            }
            
            if (user != null) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "user_left");
                notification.put("user_id", user.getId());
                broadcastToSheet(sheetId, notification, null);
            }
        }
    }
    
    private void broadcastToSheet(String sheetId, Map<String, Object> message, WebSocketSession exclude) {
        Set<WebSocketSession> sessions = sheetSessions.get(sheetId);
        if (sessions == null) return;
        
        try {
            String json = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(json);
            
            for (WebSocketSession s : sessions) {
                if (s != exclude && s.isOpen()) {
                    try {
                        s.sendMessage(textMessage);
                    } catch (Exception e) {
                        // ignore
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
    }
    
    private String extractToken(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query == null) return null;
        
        for (String param : query.split("&")) {
            String[] parts = param.split("=", 2);
            if (parts.length == 2 && "token".equals(parts[0])) {
                return parts[1];
            }
        }
        return null;
    }
}
