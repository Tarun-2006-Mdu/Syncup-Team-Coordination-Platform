package com.example.demo.controller;

import com.example.demo.dto.TaskRequestDto;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.TeamTask;
import com.example.demo.service.TaskExecutionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskExecutionService taskService;

    public TaskController(TaskExecutionService taskService) {
        this.taskService = taskService;
    }

    @PreAuthorize("hasRole('PROJECT_COORDINATOR')")
    @PostMapping
    public ResponseEntity<TeamTask> createTask(
            @RequestBody TaskRequestDto dto) {

        TeamTask task = taskService.createTask(dto);

        return new ResponseEntity<>(
                task,
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("hasAnyRole('PROJECT_COORDINATOR','TEAM_MEMBER')")
    @GetMapping
    public ResponseEntity<List<TeamTask>> getAllTasks() {

        return ResponseEntity.ok(
                taskService.getAllTasks()
        );
    }

    @PreAuthorize("hasAnyRole('PROJECT_COORDINATOR','TEAM_MEMBER')")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TeamTask>> getTasksByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                taskService.getTasksByProject(projectId)
        );
    }

    @PreAuthorize("hasAnyRole('PROJECT_COORDINATOR','TEAM_MEMBER')")
    @PutMapping("/{taskId}/status")
    public ResponseEntity<TeamTask> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam TaskStatus status,
            Authentication authentication) {

        TeamTask updatedTask =
                taskService.updateStatus(
                        taskId,
                        status,
                        authentication.getName()
                );

        return ResponseEntity.ok(updatedTask);
    }

    @PreAuthorize("hasAnyRole('PROJECT_COORDINATOR','TEAM_MEMBER')")
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TeamTask> patchTaskStatus(
            @PathVariable Long taskId,
            @RequestParam TaskStatus status,
            Authentication authentication) {

        TeamTask updatedTask =
                taskService.updateStatus(
                        taskId,
                        status,
                        authentication.getName()
                );

        return ResponseEntity.ok(updatedTask);
    }
}