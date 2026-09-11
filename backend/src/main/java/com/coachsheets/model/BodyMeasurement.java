package com.coachsheets.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BodyMeasurement {
    private String id = UUID.randomUUID().toString();
    private String date;
    private Double weight;
    private Double bodyFat;
    private Double chest;
    private Double waist;
    private Double hips;
    private Double biceps;
    private Double thigh;
    private String notes;
}
