package com.example.demo.service;

import com.example.demo.entity.SystemUser;
import com.example.demo.entity.TaskAssignment;
import com.example.demo.entity.TeamTask;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.repository.TaskAssignmentRepository;
import com.example.demo.repository.TeamTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TeamOrchestrationService {

    private final TaskAssignmentRepository assignRepo;
    private final TeamTaskRepository taskRepo;
    private final SystemUserRepository userRepo;

    public TeamOrchestrationService(
            TaskAssignmentRepository assignRepo,
            TeamTaskRepository taskRepo,
            SystemUserRepository userRepo) {

        this.assignRepo = assignRepo;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    // Assign a task to a user
    public void assignTask(Long taskId, Long userId) {

        TeamTask task = taskRepo.findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        SystemUser user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Check if already assigned
        if (assignRepo.existsByTaskIdAndUserId(
                taskId,
                userId)) {

            throw new IllegalArgumentException(
                    "Task is already assigned to this user."
            );
        }

        TaskAssignment assignment =
                TaskAssignment.builder()
                        .task(task)
                        .user(user)
                        .assignedAt(
                                LocalDateTime.now()
                        )
                        .build();

        assignRepo.save(assignment);
    }

    // Get all team members
    public List<Map<String, Object>> getTeamMembers() {

        List<SystemUser> users =
                userRepo.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (SystemUser user : users) {

            if (user.getRole() == null) {
                continue;
            }

            if (!user.getRole()
                    .toString()
                    .equals("TEAM_MEMBER")) {
                continue;
            }

            Map<String, Object> member =
                    new HashMap<>();

            member.put(
                    "id",
                    user.getId()
            );

            member.put(
                    "username",
                    user.getUsername()
            );

            member.put(
                    "email",
                    user.getEmail()
            );

            result.add(member);
        }

        return result;
    }

    // Get tasks assigned to the currently logged-in user
    public List<TeamTask> getTasksForUser(
            String username) {

        SystemUser user =
                userRepo.findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        List<TaskAssignment> assignments =
                assignRepo.findByUserId(
                        user.getId()
                );

        List<TeamTask> tasks =
                new ArrayList<>();

        for (TaskAssignment assignment : assignments) {

            tasks.add(
                    assignment.getTask()
            );
        }

        return tasks;
    }

    // Get workload of team members only
    public List<Map<String, Object>> getWorkload() {

        List<SystemUser> users =
                userRepo.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (SystemUser user : users) {

            // Skip users without a role
            if (user.getRole() == null) {
                continue;
            }

            // Only include TEAM_MEMBER users
            if (!user.getRole()
                    .toString()
                    .equals("TEAM_MEMBER")) {
                continue;
            }

            long assignedTasks =
                    assignRepo.countByUserId(
                            user.getId()
                    );

            Map<String, Object> workload =
                    new HashMap<>();

            workload.put(
                    "userId",
                    user.getId()
            );

            workload.put(
                    "username",
                    user.getUsername()
            );

            workload.put(
                    "assignedTasks",
                    assignedTasks
            );

            workload.put(
                    "capacity",
                    10
            );

            result.add(workload);
        }

        return result;
    }
}