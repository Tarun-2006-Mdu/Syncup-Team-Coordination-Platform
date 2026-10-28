package com.example.demo.service;

import com.example.demo.dto.ProjectRequestDto;
import com.example.demo.entity.ProjectStatus;
import com.example.demo.entity.TaskPriority;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.TeamProject;
import com.example.demo.repository.TeamProjectRepository;
import com.example.demo.repository.TeamTaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectOrchestrationService {

    private final TeamProjectRepository projRepo;
    private final TeamTaskRepository taskRepo;

    public ProjectOrchestrationService(TeamProjectRepository projRepo,
                                       TeamTaskRepository taskRepo) {
        this.projRepo = projRepo;
        this.taskRepo = taskRepo;
    }

    // Create Project
    public TeamProject createProject(ProjectRequestDto dto) {

        TeamProject project = TeamProject.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(ProjectStatus.PLANNING)
                .priority(dto.getPriority() != null
                        ? dto.getPriority()
                        : TaskPriority.MEDIUM)
                .build();

        return projRepo.save(project);
    }

    // Update Project
    public TeamProject updateProject(Long id, ProjectRequestDto dto) {

        TeamProject project = projRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());

        project.setPriority(
                dto.getPriority() != null
                        ? dto.getPriority()
                        : TaskPriority.MEDIUM
        );

        return projRepo.save(project);
    }

    // Archive Project
    public void archiveProject(Long id) {

        TeamProject project = projRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setStatus(ProjectStatus.ARCHIVED);

        projRepo.save(project);
    }

    // Get All Projects
    public List<TeamProject> getAllProjects() {
        return projRepo.findAll();
    }

    // Get Projects Assigned to User
    public List<TeamProject> getProjectsForUser(Long userId) {
        return projRepo.findProjectsByAssignedUser(userId);
    }

    // Calculate Completion Percentage
    public double calculateCompletionPercentage(Long projectId) {

        long totalTasks = taskRepo.countByProjectId(projectId);

        if (totalTasks == 0) {
            return 0.0;
        }

        long completedTasks =
                taskRepo.countByProjectIdAndStatus(
                        projectId,
                        TaskStatus.DONE
                );

        return (completedTasks * 100.0) / totalTasks;
    }

    // Get Project Status
    public ProjectStatus getProjectStatus(Long projectId) {

        TeamProject project = projRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return project.getStatus();
    }
}