package com.coachsheets.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 20)
    private String role; // "coach" or "athlete"
    
    @Column(name = "coach_id", length = 36)
    private String coachId;
    
    @Column(name = "created_at", nullable = false)
    private String createdAt;
    
    public static User create(String email, String password, String name, String role) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPassword(password);
        user.setName(name);
        user.setRole(role);
        user.setCreatedAt(Instant.now().toString());
        return user;
    }
}
