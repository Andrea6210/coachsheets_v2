package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChangePasswordRequest {
    @JsonProperty("old_password")
    @JsonAlias({"oldPassword", "old_password"})
    private String oldPassword;

    @JsonProperty("new_password")
    @JsonAlias({"newPassword", "new_password"})
    private String newPassword;
}
