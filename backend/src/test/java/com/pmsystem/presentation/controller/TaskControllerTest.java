package com.pmsystem.presentation.controller;

import com.pmsystem.application.port.in.TaskUseCase;
import com.pmsystem.domain.model.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class TaskControllerTest {

    @Mock
    private TaskUseCase taskUseCase;

    @InjectMocks
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllTasks_ReturnsPageOfTasks() {
        Page<Task> page = new PageImpl<>(List.of(Task.builder().build()));
        when(taskUseCase.getAllTasks(any())).thenReturn(page);

        ResponseEntity<Page<Task>> response = taskController.getAllTasks(PageRequest.of(0, 10));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void getTaskById_ReturnsTask() {
        Task task = Task.builder().build();
        when(taskUseCase.getTaskById(1L)).thenReturn(task);

        ResponseEntity<Task> response = taskController.getTaskById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(task);
    }

    @Test
    void createTask_ReturnsCreatedTask() {
        Task task = Task.builder().build();
        when(taskUseCase.createTask(any())).thenReturn(task);

        ResponseEntity<Task> response = taskController.createTask(task);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(task);
    }

    @Test
    void updateTask_ReturnsUpdatedTask() {
        Task task = Task.builder().build();
        when(taskUseCase.updateTask(eq(1L), any())).thenReturn(task);

        ResponseEntity<Task> response = taskController.updateTask(1L, task);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(task);
    }

    @Test
    void deleteTask_ReturnsNoContent() {
        doNothing().when(taskUseCase).deleteTask(1L);

        ResponseEntity<Void> response = taskController.deleteTask(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(taskUseCase, times(1)).deleteTask(1L);
    }
}
