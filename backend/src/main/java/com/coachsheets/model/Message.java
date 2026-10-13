package com.coachsheets.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    
    @JsonProperty("sender_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"senderId", "sender_id"})
    @Column(name = "sender_id", nullable = false, length = 36)
    private String senderId;
    
    @JsonProperty("receiver_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"receiverId", "receiver_id"})
    @Column(name = "receiver_id", nullable = false, length = 36)
    private String receiverId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @JsonProperty("created_at")
    @com.fasterxml.jackson.annotation.JsonAlias({"createdAt", "created_at"})
    @Column(name = "created_at", nullable = false)
    private String createdAt;
    
    @JsonProperty("is_read")
    @com.fasterxml.jackson.annotation.JsonAlias({"read", "is_read", "isRead"})
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
