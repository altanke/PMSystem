package com.pmsystem.presentation.controller;

import com.pmsystem.domain.dto.ResourceDto;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.ResourceEntity;
import com.pmsystem.infrastructure.persistence.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit-тесты для ResourceController.
 * ResourceController напрямую использует ResourceRepository,
 * поэтому тестируется вся бизнес-логика ресурсов на уровне контроллера.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceController — юнит-тесты")
class ResourceControllerTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceController resourceController;

    private ResourceEntity resourceEntity;
    private ProjectEntity projectEntity;

    @BeforeEach
    void setUp() {
        projectEntity = new ProjectEntity();
        projectEntity.setId(10L);
        projectEntity.setName("Test Project");
        projectEntity.setStatus("PLANNED");

        resourceEntity = new ResourceEntity();
        resourceEntity.setId(1L);
        resourceEntity.setName("Developer");
        resourceEntity.setType("HUMAN");
        resourceEntity.setCostPerUnit(new BigDecimal("1500.00"));
        resourceEntity.setProject(projectEntity);
    }

    // ─────────────────────────── getAllResources ───────────────────────────

    @Test
    @DisplayName("getAllResources: должен вернуть список всех ресурсов")
    void getAllResources_ShouldReturnListOfResources() {
        when(resourceRepository.findAll()).thenReturn(List.of(resourceEntity));

        ResponseEntity<List<ResourceDto>> response = resourceController.getAllResources();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        ResourceDto dto = response.getBody().get(0);
        assertEquals(1L, dto.id());
        assertEquals("Developer", dto.name());
        assertEquals("HUMAN", dto.type());
        assertEquals(new BigDecimal("1500.00"), dto.costPerUnit());
        assertEquals(10L, dto.projectId());

        verify(resourceRepository).findAll();
    }

    @Test
    @DisplayName("getAllResources: пустой репозиторий — должен вернуть пустой список")
    void getAllResources_EmptyRepository_ShouldReturnEmptyList() {
        when(resourceRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<ResourceDto>> response = resourceController.getAllResources();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(resourceRepository).findAll();
    }

    // ─────────────────────────── getByProject ───────────────────────────

    @Test
    @DisplayName("getByProject: должен вернуть ресурсы конкретного проекта")
    void getByProject_ShouldReturnProjectResources() {
        when(resourceRepository.findByProjectId(10L)).thenReturn(List.of(resourceEntity));

        ResponseEntity<List<ResourceDto>> response = resourceController.getByProject(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(10L, response.getBody().get(0).projectId());
        verify(resourceRepository).findByProjectId(10L);
    }

    @Test
    @DisplayName("getByProject: нет ресурсов у проекта — должен вернуть пустой список")
    void getByProject_NoResources_ShouldReturnEmptyList() {
        when(resourceRepository.findByProjectId(99L)).thenReturn(Collections.emptyList());

        ResponseEntity<List<ResourceDto>> response = resourceController.getByProject(99L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(resourceRepository).findByProjectId(99L);
    }

    // ─────────────────────────── createResource ───────────────────────────

    @Test
    @DisplayName("createResource: валидный запрос — должен сохранить и вернуть ресурс")
    void createResource_ValidRequest_ShouldSaveAndReturn() {
        ResourceDto request = new ResourceDto(null, 10L, "Server", "EQUIPMENT", new BigDecimal("5000.00"));

        ResourceEntity savedEntity = new ResourceEntity();
        savedEntity.setId(2L);
        savedEntity.setName("Server");
        savedEntity.setType("EQUIPMENT");
        savedEntity.setCostPerUnit(new BigDecimal("5000.00"));
        savedEntity.setProject(projectEntity);

        when(resourceRepository.save(any(ResourceEntity.class))).thenReturn(savedEntity);

        ResponseEntity<ResourceDto> response = resourceController.createResource(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2L, response.getBody().id());
        assertEquals("Server", response.getBody().name());
        assertEquals("EQUIPMENT", response.getBody().type());
        assertEquals(new BigDecimal("5000.00"), response.getBody().costPerUnit());
        verify(resourceRepository).save(any(ResourceEntity.class));
    }

    @Test
    @DisplayName("createResource: без projectId — должен бросить IllegalArgumentException")
    void createResource_WithoutProjectId_ShouldThrowIllegalArgumentException() {
        ResourceDto request = new ResourceDto(null, null, "Developer", "HUMAN", new BigDecimal("1000.00"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceController.createResource(request)
        );

        verify(resourceRepository, never()).save(any());
    }

    @Test
    @DisplayName("createResource: ресурс типа HUMAN — должен корректно сохранить тип")
    void createResource_HumanType_ShouldPersistCorrectType() {
        ResourceDto request = new ResourceDto(null, 10L, "Designer", "HUMAN", new BigDecimal("2000.00"));

        ResourceEntity savedEntity = new ResourceEntity();
        savedEntity.setId(3L);
        savedEntity.setName("Designer");
        savedEntity.setType("HUMAN");
        savedEntity.setCostPerUnit(new BigDecimal("2000.00"));
        savedEntity.setProject(projectEntity);

        when(resourceRepository.save(any(ResourceEntity.class))).thenAnswer(inv -> {
            ResourceEntity e = inv.getArgument(0);
            assertEquals("HUMAN", e.getType());
            assertEquals("Designer", e.getName());
            return savedEntity;
        });

        ResponseEntity<ResourceDto> response = resourceController.createResource(request);

        assertEquals("HUMAN", response.getBody().type());
    }

    @Test
    @DisplayName("createResource: ресурс типа SOFTWARE — должен корректно сохранить тип")
    void createResource_SoftwareType_ShouldPersistCorrectType() {
        ResourceDto request = new ResourceDto(null, 10L, "IntelliJ IDEA", "SOFTWARE", new BigDecimal("400.00"));

        ResourceEntity savedEntity = new ResourceEntity();
        savedEntity.setId(4L);
        savedEntity.setName("IntelliJ IDEA");
        savedEntity.setType("SOFTWARE");
        savedEntity.setCostPerUnit(new BigDecimal("400.00"));
        savedEntity.setProject(projectEntity);

        when(resourceRepository.save(any(ResourceEntity.class))).thenReturn(savedEntity);

        ResponseEntity<ResourceDto> response = resourceController.createResource(request);

        assertEquals("SOFTWARE", response.getBody().type());
    }

    // ─────────────────────────── deleteResource ───────────────────────────

    @Test
    @DisplayName("deleteResource: существующий ID — должен удалить ресурс и вернуть 204")
    void deleteResource_ExistingId_ShouldDeleteAndReturn204() {
        doNothing().when(resourceRepository).deleteById(1L);

        ResponseEntity<Void> response = resourceController.deleteResource(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(resourceRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteResource: метод вызывает deleteById ровно один раз")
    void deleteResource_ShouldCallDeleteByIdExactlyOnce() {
        doNothing().when(resourceRepository).deleteById(5L);

        resourceController.deleteResource(5L);

        verify(resourceRepository, times(1)).deleteById(5L);
    }

    // ─────────────────────────── бизнес-логика costPerUnit ───────────────────────────

    @Test
    @DisplayName("бизнес: costPerUnit = 0 — должен допускать сохранение бесплатного ресурса")
    void createResource_ZeroCost_ShouldBeAllowed() {
        ResourceDto request = new ResourceDto(null, 10L, "Free Tool", "SOFTWARE", BigDecimal.ZERO);

        ResourceEntity savedEntity = new ResourceEntity();
        savedEntity.setId(5L);
        savedEntity.setName("Free Tool");
        savedEntity.setType("SOFTWARE");
        savedEntity.setCostPerUnit(BigDecimal.ZERO);
        savedEntity.setProject(projectEntity);

        when(resourceRepository.save(any(ResourceEntity.class))).thenReturn(savedEntity);

        ResponseEntity<ResourceDto> response = resourceController.createResource(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getBody().costPerUnit()));
    }

    @Test
    @DisplayName("бизнес: dto корректно маппит projectId через project.getId()")
    void getAllResources_ResourceWithProject_ShouldMapProjectIdCorrectly() {
        when(resourceRepository.findAll()).thenReturn(List.of(resourceEntity));

        ResponseEntity<List<ResourceDto>> response = resourceController.getAllResources();

        assertEquals(10L, response.getBody().get(0).projectId());
    }

    @Test
    @DisplayName("бизнес: ресурс без проекта — projectId должен быть null")
    void getAllResources_ResourceWithoutProject_ShouldHaveNullProjectId() {
        ResourceEntity entityWithoutProject = new ResourceEntity();
        entityWithoutProject.setId(6L);
        entityWithoutProject.setName("Orphan Resource");
        entityWithoutProject.setType("MATERIAL");
        entityWithoutProject.setCostPerUnit(new BigDecimal("100.00"));
        entityWithoutProject.setProject(null);

        when(resourceRepository.findAll()).thenReturn(List.of(entityWithoutProject));

        ResponseEntity<List<ResourceDto>> response = resourceController.getAllResources();

        assertNull(response.getBody().get(0).projectId());
    }
}
