package com.coachsheets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DuplicateSheetRequest {
    private List<String> athleteIds;
}
