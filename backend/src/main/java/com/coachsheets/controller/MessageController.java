package com.coachsheets.controller;

import com.coachsheets.dto.SendMessageRequest;
import com.coachsheets.model.Message;
import com.coachsheets.model.User;
import com.coachsheets.repository.MessageRepository;
import com.coachsheets.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    public MessageController(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }
    
    @PostMapping
    public Message sendMessage(@AuthenticationPrincipal User sender,
                                @RequestBody SendMessageRequest request) {
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));
        
        // Verify relationship
        boolean isRelated;
        if ("coach".equals(sender.getRole())) {
            isRelated = sender.getId().equals(receiver.getCoachId());
        } else {
            isRelated = receiver.getId().equals(sender.getCoachId());
        }
        
        if (!isRelated) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to message this user");
        }
        
        Message message = Message.create(sender.getId(), receiver.getId(), request.getContent());
        return messageRepository.save(message);
    }
    
    @GetMapping("/{userId}")
    public List<Message> getMessages(@AuthenticationPrincipal User user,
                                      @PathVariable String userId) {
        return messageRepository.findConversation(user.getId(), userId);
    }
}
