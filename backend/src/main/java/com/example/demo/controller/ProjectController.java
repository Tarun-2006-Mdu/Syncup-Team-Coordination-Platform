package com.example.demo.controller;

import com.example.demo.dto.ProjectRequestDto;
import com.example.demo.entity.ProjectStatus;
import com.example.demo.entity.TeamProject;
import com.example.demo.service.ProjectOrchestrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectOrchestrationService projectService;

    public ProjectController(ProjectOrchestrationService projectService) {
        this.projectService = projectService;
    }

    // Create Project
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @PostMapping
    public ResponseEntity<TeamProject> createProject(@RequestBody ProjectRequestDto dto) {

        TeamProject project = projectService.createProject(dto);
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    // Update Project
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @PutMapping("/{id}")
    public ResponseEntity<TeamProject> updateProject(
            @PathVariable("id") Long id,
            @RequestBody ProjectRequestDto dto) {

        TeamProject project = projectService.updateProject(id, dto);
        return ResponseEntity.ok(project);
    }

    // Archive Project
    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @PatchMapping("/{projectId}/archive")
    public ResponseEntity<String> archiveProject(
            @PathVariable("projectId") Long projectId) {

        projectService.archiveProject(projectId);
        return ResponseEntity.ok("Project archived successfully.");
    }

    // Get All Projects
    @GetMapping
    public ResponseEntity<List<TeamProject>> getAllProjects(
            Authentication authentication) {

        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // Get Projects Assigned to User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TeamProject>> getProjectsForUser(
            @PathVariable("userId") Long userId) {

        return ResponseEntity.ok(projectService.getProjectsForUser(userId));
    }

    // Get Progress
    @GetMapping("/{id}/completion")
    public ResponseEntity<Double> getProgress(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                projectService.calculateCompletionPercentage(id)
        );
    }

    // Get Project Status
    @GetMapping("/{id}/status")
    public ResponseEntity<ProjectStatus> getProjectStatus(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                projectService.getProjectStatus(id)
        );
    }
}