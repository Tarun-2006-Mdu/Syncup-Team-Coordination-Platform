package com.example.demo.dto;

import com.example.demo.entity.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectRequestDto {

    private String name;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private TaskPriority priority;
}