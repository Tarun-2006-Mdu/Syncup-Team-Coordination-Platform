package com.example.demo.repository;

import com.example.demo.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    List<TaskAssignment> findByTaskId(Long taskId);

    List<TaskAssignment> findByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByTaskIdAndUserId(Long taskId, Long userId);
}