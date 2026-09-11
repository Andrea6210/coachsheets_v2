package com.coachsheets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String tokenType = "bearer";
    private UserResponse user;
    
    public TokenResponse(String accessToken, UserResponse user) {
        this.accessToken = accessToken;
        this.tokenType = "bearer";
        this.user = user;
    }
}
