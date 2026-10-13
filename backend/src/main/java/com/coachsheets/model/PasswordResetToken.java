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
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 64)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    public static PasswordResetToken create(String email, String token, int expiryMinutes) {
        PasswordResetToken prt = new PasswordResetToken();
        prt.setId(UUID.randomUUID().toString());
        prt.setEmail(email.toLowerCase().trim());
        prt.setToken(token);
        prt.setExpiryDate(Instant.now().plusSeconds(expiryMinutes * 60L));
        return prt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}
