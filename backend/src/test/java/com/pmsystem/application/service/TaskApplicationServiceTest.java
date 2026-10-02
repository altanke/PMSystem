package com.pmsystem.application.service;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.domain.model.Task;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import com.pmsystem.infrastructure.persistence.mapper.TaskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskApplicationService - Unit tests")
class TaskApplicationServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskApplicationService taskService;

    private TaskEntity taskEntity;
    private Task taskDomain;
    private ProjectEntity projectEntity;

    @BeforeEach
    void setUp() {
        projectEntity = new ProjectEntity();
        projectEntity.setId(10L);
        projectEntity.setName("Test Project");
        projectEntity.setStatus("PLANNED");

        taskEntity = new TaskEntity();
        taskEntity.setId(1L);
        taskEntity.setName("Test Task");
        taskEntity.setStatus("TODO");
        taskEntity.setPriority("HIGH");
        taskEntity.setDurationEstimateHours(8.0);
        taskEntity.setProject(projectEntity);

        taskDomain = Task.builder()
                .id(1L)
                .projectId(10L)
                .name("Test Task")
                .status("TODO")
                .priority("HIGH")
                .durationEstimateHours(8.0)
                .build();
    }

    // ─────────────────────────── getAllTasks ───────────────────────────

    @Test
    @DisplayName("getAllTasks: должен вернуть страницу задач")
    void getAllTasks_ShouldReturnPageOfTasks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<TaskEntity> entityPage = new PageImpl<>(List.of(taskEntity));

        when(taskRepository.findAll(pageable)).thenReturn(entityPage);
        when(taskMapper.toDomain(taskEntity)).thenReturn(taskDomain);

        Page<Task> result = taskService.getAllTasks(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Task", result.getContent().get(0).getName());
        verify(taskRepository).findAll(pageable);
    }

    @Test
    @DisplayName("getAllTasks: пустой репозиторий — должен вернуть пустую страницу")
    void getAllTasks_EmptyRepository_ShouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(taskRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<Task> result = taskService.getAllTasks(pageable);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        verify(taskRepository).findAll(pageable);
    }

    // ─────────────────────────── getTaskById ───────────────────────────

    @Test
    @DisplayName("getTaskById: существующий ID — должен вернуть задачу")
    void getTaskById_ExistingId_ShouldReturnTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(taskEntity));
        when(taskMapper.toDomain(taskEntity)).thenReturn(taskDomain);

        Task result = taskService.getTaskById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Task", result.getName());
        verify(taskRepository).findById(1L);
        verify(taskMapper).toDomain(taskEntity);
    }

    @Test
    @DisplayName("getTaskById: несуществующий ID — должен бросить ResourceNotFoundException")
    void getTaskById_NonExistingId_ShouldThrowException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.getTaskById(999L)
        );

        assertTrue(ex.getMessage().contains("999"));
        verify(taskRepository).findById(999L);
        verify(taskMapper, never()).toDomain(any());
    }

    // ─────────────────────────── createTask ───────────────────────────

    @Test
    @DisplayName("createTask: валидная задача — должен сохранить и вернуть задачу")
    void createTask_ValidTask_ShouldSaveAndReturnTask() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(projectEntity));
        when(taskMapper.toEntity(taskDomain)).thenReturn(taskEntity);
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(taskEntity);
        when(taskMapper.toDomain(taskEntity)).thenReturn(taskDomain);

        Task result = taskService.createTask(taskDomain);

        assertNotNull(result);
        assertEquals("Test Task", result.getName());
        verify(projectRepository).findById(10L);
        verify(taskRepository).save(any(TaskEntity.class));
        verify(taskMapper).toDomain(taskEntity);
    }

    @Test
    @DisplayName("createTask: без projectId — должен бросить IllegalArgumentException")
    void createTask_WithoutProjectId_ShouldThrowIllegalArgumentException() {
        Task taskWithoutProject = Task.builder()
                .name("Task Without Project")
                .build();

        assertThrows(
                IllegalArgumentException.class,
                () -> taskService.createTask(taskWithoutProject)
        );

        verify(projectRepository, never()).findById(any());
        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("createTask: несуществующий проект — должен бросить ResourceNotFoundException")
    void createTask_ProjectNotFound_ShouldThrowException() {
        when(projectRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.createTask(taskDomain)
        );

        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("createTask: задача без статуса — должна получить статус TODO по умолчанию")
    void createTask_WithoutStatus_ShouldSetDefaultStatusTodo() {
        Task taskNoStatus = Task.builder()
                .projectId(10L)
                .name("Task No Status")
                .priority("LOW")
                .durationEstimateHours(4.0)
                .build();

        TaskEntity entityNoStatus = new TaskEntity();
        entityNoStatus.setId(2L);
        entityNoStatus.setName("Task No Status");
        entityNoStatus.setStatus(null); // mapper не установил статус
        entityNoStatus.setPriority("LOW");

        Task expectedDomain = Task.builder()
                .id(2L)
                .projectId(10L)
                .name("Task No Status")
                .status("TODO")
                .build();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(projectEntity));
        when(taskMapper.toEntity(taskNoStatus)).thenReturn(entityNoStatus);
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> {
            TaskEntity e = inv.getArgument(0);
            // Сервис должен установить статус TODO
            assertEquals("TODO", e.getStatus());
            return e;
        });
        when(taskMapper.toDomain(any(TaskEntity.class))).thenReturn(expectedDomain);

        Task result = taskService.createTask(taskNoStatus);

        assertNotNull(result);
        verify(taskRepository).save(any(TaskEntity.class));
    }

    // ─────────────────────────── updateTask ───────────────────────────

    @Test
    @DisplayName("updateTask: существующая задача — должен обновить поля и сохранить")
    void updateTask_ExistingTask_ShouldUpdateFields() {
        Task updatedDomain = Task.builder()
                .name("Updated Task")
                .description("New description")
                .status("IN_PROGRESS")
                .priority("MEDIUM")
                .durationEstimateHours(12.0)
                .build();

        TaskEntity updatedEntity = new TaskEntity();
        updatedEntity.setId(1L);
        updatedEntity.setName("Updated Task");
        updatedEntity.setStatus("IN_PROGRESS");

        Task expectedResult = Task.builder()
                .id(1L)
                .name("Updated Task")
                .status("IN_PROGRESS")
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(taskEntity));
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(updatedEntity);
        when(taskMapper.toDomain(updatedEntity)).thenReturn(expectedResult);

        Task result = taskService.updateTask(1L, updatedDomain);

        assertNotNull(result);
        assertEquals("Updated Task", result.getName());
        assertEquals("IN_PROGRESS", result.getStatus());
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(TaskEntity.class));
    }

    @Test
    @DisplayName("updateTask: несуществующий ID — должен бросить ResourceNotFoundException")
    void updateTask_NonExistingId_ShouldThrowException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.updateTask(999L, taskDomain)
        );

        verify(taskRepository, never()).save(any());
    }

    // ─────────────────────────── deleteTask ───────────────────────────

    @Test
    @DisplayName("deleteTask: существующий ID — должен удалить задачу")
    void deleteTask_ExistingId_ShouldDeleteTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(taskEntity));
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(taskEntity);
        doNothing().when(taskRepository).delete(taskEntity);

        assertDoesNotThrow(() -> taskService.deleteTask(1L));

        verify(taskRepository).findById(1L);
        verify(taskRepository).save(taskEntity); // flush cleared collections
        verify(taskRepository).delete(taskEntity);
    }

    @Test
    @DisplayName("deleteTask: несуществующий ID — должен бросить ResourceNotFoundException")
    void deleteTask_NonExistingId_ShouldThrowException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.deleteTask(999L)
        );

        verify(taskRepository, never()).delete(any(TaskEntity.class));
    }

    // ─────────────────────────── бизнес-логика ───────────────────────────

    @Test
    @DisplayName("updateTask: смена статуса с TODO на DONE — должна сохраниться корректно")
    void updateTask_ChangeStatusFromTodoToDone_ShouldPersistStatusChange() {
        Task doneUpdate = Task.builder()
                .name("Test Task")
                .status("DONE")
                .priority("HIGH")
                .durationEstimateHours(8.0)
                .build();

        TaskEntity savedEntity = new TaskEntity();
        savedEntity.setId(1L);
        savedEntity.setStatus("DONE");

        Task doneDomain = Task.builder().id(1L).status("DONE").build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(taskEntity));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> {
            TaskEntity e = inv.getArgument(0);
            assertEquals("DONE", e.getStatus());
            return savedEntity;
        });
        when(taskMapper.toDomain(savedEntity)).thenReturn(doneDomain);

        Task result = taskService.updateTask(1L, doneUpdate);

        assertEquals("DONE", result.getStatus());
    }
}
