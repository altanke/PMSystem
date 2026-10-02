package com.pmsystem.presentation.controller;

import com.pmsystem.domain.dto.ResourceDto;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.ResourceEntity;
import com.pmsystem.infrastructure.persistence.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ResourceControllerTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceController resourceController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllResources_ReturnsList() {
        ResourceEntity entity = new ResourceEntity();
        when(resourceRepository.findAll()).thenReturn(List.of(entity));

        ResponseEntity<List<ResourceDto>> response = resourceController.getAllResources();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getByProject_ReturnsList() {
        ResourceEntity entity = new ResourceEntity();
        ProjectEntity project = new ProjectEntity();
        project.setId(1L);
        entity.setProject(project);

        when(resourceRepository.findByProjectId(1L)).thenReturn(List.of(entity));

        ResponseEntity<List<ResourceDto>> response = resourceController.getByProject(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).projectId()).isEqualTo(1L);
    }

    @Test
    void createResource_RequiresProjectId() {
        ResourceDto dto = new ResourceDto(null, null, "Name", "Type", BigDecimal.TEN);
        assertThatThrownBy(() -> resourceController.createResource(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createResource_SavesAndReturns() {
        ResourceDto dto = new ResourceDto(null, 1L, "Name", "Type", BigDecimal.TEN);
        ResourceEntity saved = new ResourceEntity();
        saved.setId(10L);
        ProjectEntity proj = new ProjectEntity();
        proj.setId(1L);
        saved.setProject(proj);

        when(resourceRepository.save(any())).thenReturn(saved);

        ResponseEntity<ResourceDto> response = resourceController.createResource(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().id()).isEqualTo(10L);
    }

    @Test
    void deleteResource_ReturnsNoContent() {
        doNothing().when(resourceRepository).deleteById(1L);
        ResponseEntity<Void> response = resourceController.deleteResource(1L);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(resourceRepository).deleteById(1L);
    }
}
