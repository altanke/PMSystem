package com.pmsystem.presentation.controller;

import com.pmsystem.application.port.in.ProjectUseCase;
import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.model.Project;
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

class ProjectControllerTest {

    @Mock
    private ProjectUseCase projectUseCase;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllProjects_ReturnsPageOfProjects() {
        Page<Project> page = new PageImpl<>(List.of(Project.builder().build()));
        when(projectUseCase.getAllProjects(any())).thenReturn(page);

        ResponseEntity<Page<Project>> response = projectController.getAllProjects(PageRequest.of(0, 10));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void getProjectById_ReturnsProject() {
        Project project = Project.builder().build();
        when(projectUseCase.getProjectById(1L)).thenReturn(project);

        ResponseEntity<Project> response = projectController.getProjectById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(project);
    }

    @Test
    void createProject_ReturnsCreated() {
        Project project = Project.builder().build();
        when(projectUseCase.createProject(any())).thenReturn(project);

        ResponseEntity<Project> response = projectController.createProject(project);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(project);
    }

    @Test
    void updateProject_ReturnsUpdated() {
        Project project = Project.builder().build();
        when(projectUseCase.updateProject(eq(1L), any())).thenReturn(project);

        ResponseEntity<Project> response = projectController.updateProject(1L, project);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(project);
    }

    @Test
    void calculateAndSaveCriticalPath_ReturnsResults() {
        List<CPMResultDTO> cpmResults = List.of(new CPMResultDTO(1L, 0, 0, 0, 0, 0, true));
        when(projectUseCase.calculateAndSaveCriticalPath(1L)).thenReturn(cpmResults);

        ResponseEntity<List<CPMResultDTO>> response = projectController.calculateAndSaveCriticalPath(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(cpmResults);
    }
}
