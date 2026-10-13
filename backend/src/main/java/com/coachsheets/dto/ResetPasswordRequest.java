package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResetPasswordRequest {
    private String email;
    private String token;

    @JsonProperty("new_password")
    @JsonAlias({"newPassword", "new_password"})
    private String newPassword;
}
