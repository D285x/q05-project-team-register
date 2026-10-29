package com.exam.app;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Roll Number is required")
    private String rollNumber;

    @NotBlank(message = "Student Name is required")
    private String studentName;

    @NotBlank(message = "Team Name is required")
    private String teamName;

    @NotBlank(message = "Project Title is required")
    private String projectTitle;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
}
