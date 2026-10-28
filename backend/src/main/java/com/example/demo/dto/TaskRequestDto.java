package com.example.demo.dto;

import com.example.demo.entity.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequestDto {

    private Long projectId;
    private String title;
    private String description;
    private TaskPriority priority;
    private LocalDate dueDate;
}