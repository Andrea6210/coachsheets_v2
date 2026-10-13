package com.coachsheets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SendMessageRequest {
    @JsonProperty("receiver_id")
    @JsonAlias({"receiverId", "receiver_id"})
    private String receiverId;
    
    private String content;
}

