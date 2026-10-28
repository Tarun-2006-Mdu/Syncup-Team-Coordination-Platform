package com.example.demo.service;

import com.example.demo.dto.TaskRequestDto;
import com.example.demo.entity.ProjectStatus;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.TeamProject;
import com.example.demo.entity.TeamTask;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.repository.TaskAssignmentRepository;
import com.example.demo.repository.TeamProjectRepository;
import com.example.demo.repository.TeamTaskRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskExecutionService {

    private final TeamTaskRepository taskRepo;
    private final TeamProjectRepository projRepo;
    private final TaskAssignmentRepository assignRepo;
    private final SystemUserRepository userRepo;

    public TaskExecutionService(
            TeamTaskRepository taskRepo,
            TeamProjectRepository projRepo,
            TaskAssignmentRepository assignRepo,
            SystemUserRepository userRepo) {

        this.taskRepo = taskRepo;
        this.projRepo = projRepo;
        this.assignRepo = assignRepo;
        this.userRepo = userRepo;
    }

    // =========================================================
    // CREATE TASK
    // =========================================================

    public TeamTask createTask(TaskRequestDto dto) {

        TeamProject project =
                projRepo.findById(dto.getProjectId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                ));

        TeamTask task =
                TeamTask.builder()
                        .project(project)
                        .title(dto.getTitle())
                        .description(dto.getDescription())
                        .priority(dto.getPriority())
                        .status(TaskStatus.BACKLOG)
                        .dueDate(dto.getDueDate())
                        .build();

        return taskRepo.save(task);
    }

    // =========================================================
    // GET TASKS BY PROJECT
    // =========================================================

    public List<TeamTask> getTasksByProject(
            Long projectId) {

        return taskRepo.findByProjectId(
                projectId
        );
    }

    // =========================================================
    // GET ALL TASKS
    // =========================================================

    public List<TeamTask> getAllTasks() {

        return taskRepo.findAll();
    }

    // =========================================================
    // UPDATE TASK STATUS
    // =========================================================

    public TeamTask updateStatus(
            Long taskId,
            TaskStatus newStatus,
            String username) {

        TeamTask task =
                taskRepo.findById(taskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Task not found"
                                ));

        // Get the REAL logged-in user from the database
        SystemUser user =
                userRepo.findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        // =====================================================
        // ROLE + ASSIGNMENT AUTHORIZATION
        // =====================================================

        // PROJECT_COORDINATOR can update any task
        if (user.getRole() != null &&
                user.getRole().name()
                        .equals("PROJECT_COORDINATOR")) {

            // Coordinator is allowed.
        }

        // TEAM_MEMBER can update ONLY assigned tasks
        else if (user.getRole() != null &&
                user.getRole().name()
                        .equals("TEAM_MEMBER")) {

            boolean assigned =
                    assignRepo.existsByTaskIdAndUserId(
                            taskId,
                            user.getId()
                    );

            if (!assigned) {
                throw new AccessDeniedException(
                        "You are not assigned to this task."
                );
            }
        }

        // All other roles are denied
        else {
            throw new AccessDeniedException(
                    "You do not have permission to update this task."
            );
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================

        task.setStatus(newStatus);

        TeamTask updatedTask =
                taskRepo.save(task);

        // =====================================================
        // UPDATE PROJECT STATUS AUTOMATICALLY
        // =====================================================

        TeamProject project =
                task.getProject();

        long totalTasks =
                taskRepo.countByProjectId(
                        project.getId()
                );

        long completedTasks =
                taskRepo.countByProjectIdAndStatus(
                        project.getId(),
                        TaskStatus.DONE
                );

        if (totalTasks > 0 &&
                totalTasks == completedTasks) {

            project.setStatus(
                    ProjectStatus.COMPLETED
            );

        } else {

            project.setStatus(
                    ProjectStatus.ACTIVE
            );
        }

        projRepo.save(project);

        return updatedTask;
    }
}