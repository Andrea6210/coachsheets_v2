package com.coachsheets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateAthleteRequest {
    private String email;
    private String password;
    private String name;
}
