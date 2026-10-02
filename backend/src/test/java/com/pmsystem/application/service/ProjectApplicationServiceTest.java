package com.pmsystem.application.service;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.service.CPMService;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import com.pmsystem.infrastructure.persistence.mapper.ProjectMapper;
import com.pmsystem.infrastructure.persistence.mapper.TaskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.TaskRepository;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectApplicationServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private CPMService cpmService;

    @Mock
    private WorkCalendarScheduler workCalendarScheduler;

    @InjectMocks
    private ProjectApplicationService projectApplicationService;

    @Test
    void calculateAndSaveCriticalPath_Success() {
        // Arrange
        Long projectId = 1L;
        ProjectEntity project = new ProjectEntity();
        project.setId(projectId);
        project.setStartDate(LocalDate.now());

        TaskEntity taskEntity = new TaskEntity();
        taskEntity.setId(100L);
        taskEntity.setName("Test Task");

        com.pmsystem.domain.model.Task domainTask = com.pmsystem.domain.model.Task.builder()
                .id(100L)
                .name("Test Task")
                .durationEstimateHours(5.0)
                .build();

        CPMResultDTO cpmResult = new CPMResultDTO(
                100L, 0.0, 5.0, 0.0, 5.0, 0.0, true,
                LocalDateTime.now().toString(),
                LocalDateTime.now().plusHours(5).toString(),
                LocalDateTime.now().toString(),
                LocalDateTime.now().plusHours(5).toString());

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(taskRepository.findAllByProjectIdWithDependencies(projectId)).thenReturn(List.of(taskEntity));
        when(taskMapper.toDomain(any(TaskEntity.class))).thenReturn(domainTask);
        when(cpmService.executeCalculation(anyList())).thenReturn(List.of(cpmResult));
        when(workCalendarScheduler.offsetToDatetime(any(), anyDouble()))
                .thenReturn(LocalDateTime.now());

        // Act
        List<CPMResultDTO> result = projectApplicationService.calculateAndSaveCriticalPath(projectId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isCritical());
        verify(taskRepository).saveAll(anyList());
    }
}
