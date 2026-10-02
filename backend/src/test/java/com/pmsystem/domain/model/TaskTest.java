package com.pmsystem.domain.model;

import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TaskTest {

    @Test
    void shouldCreateAndAccessTask() {
        Task task = Task.builder().build();
        task.setId(1L);
        task.setProjectId(2L);
        task.setName("Task Name");
        task.setDescription("Task Desc");
        task.setStatus("TODO");
        task.setPriority("HIGH");
        task.setDurationEstimateHours(10.0);
        
        List<com.pmsystem.domain.dto.TaskDependencyDTO> dependencies = Collections.emptyList();
        task.setPredecessors(dependencies);
        task.setSuccessors(dependencies);

        assertThat(task.getId()).isEqualTo(1L);
        assertThat(task.getProjectId()).isEqualTo(2L);
        assertThat(task.getName()).isEqualTo("Task Name");
        assertThat(task.getDescription()).isEqualTo("Task Desc");
        assertThat(task.getStatus()).isEqualTo("TODO");
        assertThat(task.getPriority()).isEqualTo("HIGH");
        assertThat(task.getDurationEstimateHours()).isEqualTo(10.0);
        assertThat(task.getPredecessors()).isEqualTo(dependencies);
        assertThat(task.getSuccessors()).isEqualTo(dependencies);
    }
}
