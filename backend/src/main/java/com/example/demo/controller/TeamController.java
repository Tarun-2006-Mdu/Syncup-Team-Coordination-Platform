package com.example.demo.controller;

import com.example.demo.entity.TeamTask;
import com.example.demo.service.TeamOrchestrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    private final TeamOrchestrationService teamService;

    public TeamController(
            TeamOrchestrationService teamService) {

        this.teamService = teamService;
    }

    // Assign task to team member
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @PostMapping("/assign")
    public ResponseEntity<String> assignTask(
            @RequestParam Long taskId,
            @RequestParam Long userId) {

        teamService.assignTask(
                taskId,
                userId
        );

        return new ResponseEntity<>(
                "Task assigned successfully.",
                HttpStatus.OK
        );
    }

    // Get team members
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @GetMapping("/members")
    public ResponseEntity<List<Map<String, Object>>> getMembers() {

        return ResponseEntity.ok(
                teamService.getTeamMembers()
        );
    }

    // Get tasks assigned to the logged-in user
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TeamTask>> getMyTasks(
            Authentication authentication) {

        return ResponseEntity.ok(
                teamService.getTasksForUser(
                        authentication.getName()
                )
        );
    }

    // Get workload
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @GetMapping("/workload")
    public ResponseEntity<List<Map<String, Object>>> getWorkload() {

        return ResponseEntity.ok(
                teamService.getWorkload()
        );
    }
}