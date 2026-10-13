package com.coachsheets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SetDetail {
    @JsonProperty("set_number")
    private Integer setNumber = 1;

    // "standard", "top_set", "back_off", "warm_up", "drop_set"
    private String type = "standard";

    private String reps = "";
    private String weight = "";
    private String intensity = ""; // e.g. "90%", "75%", "RPE 8"
    private String notes = "";
}
