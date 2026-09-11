package com.coachsheets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // e.g. "ROLE_COACH", "ROLE_ATHLETE", "ROLE_ADMIN"

    public static Role create(String name) {
        Role role = new Role();
        role.setId(UUID.randomUUID().toString());
        role.setName(name);
        return role;
    }
}
