package com.example.demo.repository;

import com.example.demo.entity.ProjectStatus;
import com.example.demo.entity.TeamProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamProjectRepository extends JpaRepository<TeamProject, Long> {

    List<TeamProject> findAllByStatus(ProjectStatus status);

    @Query("""
            SELECT DISTINCT p
            FROM TeamProject p
            JOIN TeamTask t ON t.project.id = p.id
            JOIN TaskAssignment ta ON ta.task.id = t.id
            WHERE ta.user.id = :userId
            """)
    List<TeamProject> findProjectsByAssignedUser(Long userId);

}