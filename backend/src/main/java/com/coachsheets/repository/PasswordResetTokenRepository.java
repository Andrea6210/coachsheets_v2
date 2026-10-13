package com.coachsheets.repository;

import com.coachsheets.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByEmailAndToken(String email, String token);
    void deleteByEmail(String email);
}
