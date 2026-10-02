package com.pmsystem.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectTest {

    @Test
    void addTask_ShouldAddTaskToList() {
        Project project = Project.builder()
                .id(1L)
                .name("Test")
                .description("Desc")
                .managerId(1L)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .status("PLANNED")
                .progressPercentage(10)
                .totalBudget(BigDecimal.TEN)
                .build();
                
        assertThat(project.getTasks()).isEmpty();

        Task task = Task.builder().id(2L).name("Task").build();
        project.addTask(task);

        assertThat(project.getTasks()).hasSize(1);
        assertThat(project.getTasks().get(0).getName()).isEqualTo("Task");
        
        // Test getters
        assertThat(project.getId()).isEqualTo(1L);
        assertThat(project.getDescription()).isEqualTo("Desc");
        assertThat(project.getManagerId()).isEqualTo(1L);
        assertThat(project.getStatus()).isEqualTo("PLANNED");
        assertThat(project.getProgressPercentage()).isEqualTo(10);
        assertThat(project.getTotalBudget()).isEqualTo(BigDecimal.TEN);
    }
}
