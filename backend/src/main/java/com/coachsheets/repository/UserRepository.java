package com.coachsheets.repository;

import com.coachsheets.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByCoachId(String coachId);
    boolean existsByEmail(String email);
}
