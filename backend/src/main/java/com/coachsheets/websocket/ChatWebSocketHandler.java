package com.coachsheets.websocket;

import com.coachsheets.model.Message;
import com.coachsheets.model.User;
import com.coachsheets.repository.MessageRepository;
import com.coachsheets.repository.UserRepository;
import com.coachsheets.service.JwtService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    
    public ChatWebSocketHandler(JwtService jwtService,
                                 UserRepository userRepository,
                                 MessageRepository messageRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
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
        
        userSessions.put(userId, session);
        sessionUserMap.put(session.getId(), userId);
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String senderId = sessionUserMap.get(session.getId());
        if (senderId == null) return;
        
        Map<String, Object> data = objectMapper.readValue(message.getPayload(), new TypeReference<>() {});
        String type = (String) data.get("type");
        
        if ("message".equals(type)) {
            String receiverId = (String) data.get("receiver_id");
            String content = (String) data.get("content");
            
            Message msg = Message.create(senderId, receiverId, content);
            messageRepository.save(msg);
            
            // Send to receiver
            WebSocketSession receiverSession = userSessions.get(receiverId);
            if (receiverSession != null && receiverSession.isOpen()) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "new_message");
                notification.put("message", msg);
                receiverSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(notification)));
            }
            
            // Confirm to sender
            Map<String, Object> confirmation = new HashMap<>();
            confirmation.put("type", "message_sent");
            confirmation.put("message", msg);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(confirmation)));
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = sessionUserMap.remove(session.getId());
        if (userId != null) {
            userSessions.remove(userId);
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
