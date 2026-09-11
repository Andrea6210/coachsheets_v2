package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_sender", columnList = "sender_id"),
    @Index(name = "idx_receiver", columnList = "receiver_id")
})
public class Message {
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(name = "sender_id", nullable = false, length = 36)
    private String senderId;
    
    @Column(name = "receiver_id", nullable = false, length = 36)
    private String receiverId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "created_at", nullable = false)
    private String createdAt;
    
    @Column(name = "is_read", nullable = false)
    private boolean read;
    
    public static Message create(String senderId, String receiverId, String content) {
        Message msg = new Message();
        msg.setId(UUID.randomUUID().toString());
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        msg.setCreatedAt(Instant.now().toString());
        msg.setRead(false);
        return msg;
    }
}
