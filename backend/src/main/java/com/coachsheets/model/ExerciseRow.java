package com.coachsheets.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExerciseRow {
    private String id = UUID.randomUUID().toString();
    private String exercise = "";
    private String sets = "";
    private String reps = "";
    private String weight = "";
    private String rest = "";
    private String notes = "";
    
    @JsonProperty("coach_notes")
    @JsonAlias({"coachNotes", "coach_notes"})
    private String coachNotes = "";
    
    @JsonProperty("athlete_notes")
    @JsonAlias({"athleteNotes", "athlete_notes", "athleteFeedback", "athlete_feedback"})
    private String athleteNotes = "";
    
    @JsonProperty("video_url")
    @JsonAlias({"videoUrl", "video_url"})
    private String videoUrl = "";
    
    @JsonProperty("weekly_logs")
    @JsonAlias({"weeklyLogs", "weekly_logs"})
    private List<WeeklyLog> weeklyLogs = new ArrayList<>();
    
    @JsonProperty("set_details")
    @JsonAlias({"setDetails", "set_details"})
    private List<SetDetail> setDetails = new ArrayList<>();

    @JsonProperty("superset_group")
    @JsonAlias({"supersetGroup", "superset_group"})
    private String supersetGroup = "";

    @JsonProperty("superset_order")
    @JsonAlias({"supersetOrder", "superset_order"})
    private Integer supersetOrder = 0;
}

