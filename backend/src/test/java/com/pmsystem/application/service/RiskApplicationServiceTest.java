package com.pmsystem.application.service;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.domain.model.Risk;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.RiskEntity;
import com.pmsystem.infrastructure.persistence.mapper.RiskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.RiskRepository;
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
@DisplayName("RiskApplicationService - Unit tests")
class RiskApplicationServiceTest {

    @Mock
    private RiskRepository riskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private RiskMapper riskMapper;

    @InjectMocks
    private RiskApplicationService riskService;

    private RiskEntity riskEntity;
    private Risk riskDomain;
    private ProjectEntity projectEntity;

    @BeforeEach
    void setUp() {
        projectEntity = new ProjectEntity();
        projectEntity.setId(10L);
        projectEntity.setName("Test Project");
        projectEntity.setStatus("PLANNED");

        riskEntity = new RiskEntity();
        riskEntity.setId(1L);
        riskEntity.setTitle("Test Risk");
        riskEntity.setDescription("Risk description");
        riskEntity.setLevel("Высокий");
        riskEntity.setStatus("Активен");
        riskEntity.setProject(projectEntity);

        riskDomain = Risk.builder()
                .id(1L)
                .projectId(10L)
                .title("Test Risk")
                .description("Risk description")
                .level("Высокий")
                .status("Активен")
                .build();
    }

    // ─────────────────────────── getAllRisks ───────────────────────────

    @Test
    @DisplayName("getAllRisks: должен вернуть страницу всех рисков")
    void getAllRisks_ShouldReturnPageOfRisks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<RiskEntity> page = new PageImpl<>(List.of(riskEntity));

        when(riskRepository.findAll(pageable)).thenReturn(page);
        when(riskMapper.toDomain(riskEntity)).thenReturn(riskDomain);

        Page<Risk> result = riskService.getAllRisks(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Risk", result.getContent().get(0).getTitle());
        verify(riskRepository).findAll(pageable);
    }

    @Test
    @DisplayName("getAllRisks: пустой репозиторий — должен вернуть пустую страницу")
    void getAllRisks_EmptyRepository_ShouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(riskRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<Risk> result = riskService.getAllRisks(pageable);

        assertEquals(0, result.getTotalElements());
    }

    // ─────────────────────────── getRisksByProject ───────────────────────────

    @Test
    @DisplayName("getRisksByProject: должен вернуть риски конкретного проекта")
    void getRisksByProject_ShouldReturnRisksForProject() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<RiskEntity> page = new PageImpl<>(List.of(riskEntity));

        when(riskRepository.findByProjectId(10L, pageable)).thenReturn(page);
        when(riskMapper.toDomain(riskEntity)).thenReturn(riskDomain);

        Page<Risk> result = riskService.getRisksByProject(10L, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(10L, result.getContent().get(0).getProjectId());
        verify(riskRepository).findByProjectId(10L, pageable);
    }

    @Test
    @DisplayName("getRisksByProject: нет рисков у проекта — должен вернуть пустую страницу")
    void getRisksByProject_NoRisks_ShouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(riskRepository.findByProjectId(99L, pageable))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<Risk> result = riskService.getRisksByProject(99L, pageable);

        assertEquals(0, result.getTotalElements());
        verify(riskRepository).findByProjectId(99L, pageable);
    }

    // ─────────────────────────── getRiskById ───────────────────────────

    @Test
    @DisplayName("getRiskById: существующий ID — должен вернуть риск")
    void getRiskById_ExistingId_ShouldReturnRisk() {
        when(riskRepository.findById(1L)).thenReturn(Optional.of(riskEntity));
        when(riskMapper.toDomain(riskEntity)).thenReturn(riskDomain);

        Risk result = riskService.getRiskById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Risk", result.getTitle());
        assertEquals("Высокий", result.getLevel());
        verify(riskRepository).findById(1L);
    }

    @Test
    @DisplayName("getRiskById: несуществующий ID — должен бросить ResourceNotFoundException")
    void getRiskById_NonExistingId_ShouldThrowException() {
        when(riskRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> riskService.getRiskById(999L)
        );

        assertTrue(ex.getMessage().contains("999"));
        verify(riskMapper, never()).toDomain(any());
    }

    // ─────────────────────────── createRisk ───────────────────────────

    @Test
    @DisplayName("createRisk: валидный риск — должен сохранить и вернуть риск")
    void createRisk_ValidRisk_ShouldSaveAndReturn() {
        Risk newRisk = Risk.builder()
                .title("New Risk")
                .level("Средний")
                .build();

        RiskEntity newEntity = new RiskEntity();
        newEntity.setTitle("New Risk");
        newEntity.setLevel("Средний");
        newEntity.setStatus(null); // статус не задан, сервис должен поставить "Активен"

        RiskEntity savedEntity = new RiskEntity();
        savedEntity.setId(2L);
        savedEntity.setTitle("New Risk");
        savedEntity.setLevel("Средний");
        savedEntity.setStatus("Активен");

        Risk savedDomain = Risk.builder()
                .id(2L)
                .projectId(10L)
                .title("New Risk")
                .level("Средний")
                .status("Активен")
                .build();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(projectEntity));
        when(riskMapper.toEntity(newRisk)).thenReturn(newEntity);
        when(riskRepository.save(any(RiskEntity.class))).thenAnswer(inv -> {
            RiskEntity e = inv.getArgument(0);
            // Сервис должен выставить дефолтный статус
            assertEquals("Активен", e.getStatus());
            return savedEntity;
        });
        when(riskMapper.toDomain(savedEntity)).thenReturn(savedDomain);

        Risk result = riskService.createRisk(10L, newRisk);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Активен", result.getStatus());
        verify(projectRepository).findById(10L);
        verify(riskRepository).save(any(RiskEntity.class));
    }

    @Test
    @DisplayName("createRisk: риск со статусом — должен сохранить заданный статус без перезаписи")
    void createRisk_RiskWithStatus_ShouldKeepProvidedStatus() {
        Risk riskWithStatus = Risk.builder()
                .title("Existing Status Risk")
                .level("Низкий")
                .status("Решен")
                .build();

        RiskEntity entityWithStatus = new RiskEntity();
        entityWithStatus.setTitle("Existing Status Risk");
        entityWithStatus.setStatus("Решен");

        RiskEntity savedEntity = new RiskEntity();
        savedEntity.setId(3L);
        savedEntity.setStatus("Решен");

        Risk savedDomain = Risk.builder().id(3L).status("Решен").build();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(projectEntity));
        when(riskMapper.toEntity(riskWithStatus)).thenReturn(entityWithStatus);
        when(riskRepository.save(any(RiskEntity.class))).thenAnswer(inv -> {
            RiskEntity e = inv.getArgument(0);
            // Статус уже задан — не должен быть перезаписан
            assertEquals("Решен", e.getStatus());
            return savedEntity;
        });
        when(riskMapper.toDomain(savedEntity)).thenReturn(savedDomain);

        Risk result = riskService.createRisk(10L, riskWithStatus);

        assertEquals("Решен", result.getStatus());
    }

    @Test
    @DisplayName("createRisk: несуществующий проект — должен бросить ResourceNotFoundException")
    void createRisk_ProjectNotFound_ShouldThrowException() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> riskService.createRisk(999L, riskDomain)
        );

        verify(riskRepository, never()).save(any());
    }

    // ─────────────────────────── updateRisk ───────────────────────────

    @Test
    @DisplayName("updateRisk: существующий риск — должен обновить title, level и status")
    void updateRisk_ExistingRisk_ShouldUpdateFields() {
        Risk update = Risk.builder()
                .title("Updated Risk")
                .description("Updated desc")
                .level("Низкий")
                .status("Решен")
                .build();

        RiskEntity updatedEntity = new RiskEntity();
        updatedEntity.setId(1L);
        updatedEntity.setTitle("Updated Risk");
        updatedEntity.setLevel("Низкий");
        updatedEntity.setStatus("Решен");

        Risk updatedDomain = Risk.builder()
                .id(1L)
                .title("Updated Risk")
                .level("Низкий")
                .status("Решен")
                .build();

        when(riskRepository.findById(1L)).thenReturn(Optional.of(riskEntity));
        when(riskRepository.save(any(RiskEntity.class))).thenReturn(updatedEntity);
        when(riskMapper.toDomain(updatedEntity)).thenReturn(updatedDomain);

        Risk result = riskService.updateRisk(1L, update);

        assertNotNull(result);
        assertEquals("Updated Risk", result.getTitle());
        assertEquals("Низкий", result.getLevel());
        assertEquals("Решен", result.getStatus());
        verify(riskRepository).findById(1L);
        verify(riskRepository).save(any(RiskEntity.class));
    }

    @Test
    @DisplayName("updateRisk: обновление без нового статуса — существующий статус не должен измениться")
    void updateRisk_WithoutStatus_ShouldNotOverrideExistingStatus() {
        Risk updateWithoutStatus = Risk.builder()
                .title("Updated Title")
                .description("New desc")
                .level("Средний")
                .status(null) // статус не передан
                .build();

        when(riskRepository.findById(1L)).thenReturn(Optional.of(riskEntity));
        when(riskRepository.save(any(RiskEntity.class))).thenAnswer(inv -> {
            RiskEntity e = inv.getArgument(0);
            // Статус не должен был измениться (остается "Активен")
            assertEquals("Активен", e.getStatus());
            return riskEntity;
        });
        when(riskMapper.toDomain(riskEntity)).thenReturn(riskDomain);

        riskService.updateRisk(1L, updateWithoutStatus);

        verify(riskRepository).save(any(RiskEntity.class));
    }

    @Test
    @DisplayName("updateRisk: несуществующий ID — должен бросить ResourceNotFoundException")
    void updateRisk_NonExistingId_ShouldThrowException() {
        when(riskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> riskService.updateRisk(999L, riskDomain)
        );

        verify(riskRepository, never()).save(any());
    }

    // ─────────────────────────── deleteRisk ───────────────────────────

    @Test
    @DisplayName("deleteRisk: существующий ID — должен удалить риск")
    void deleteRisk_ExistingId_ShouldDeleteRisk() {
        when(riskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(riskRepository).deleteById(1L);

        assertDoesNotThrow(() -> riskService.deleteRisk(1L));

        verify(riskRepository).existsById(1L);
        verify(riskRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteRisk: несуществующий ID — должен бросить ResourceNotFoundException")
    void deleteRisk_NonExistingId_ShouldThrowException() {
        when(riskRepository.existsById(999L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> riskService.deleteRisk(999L)
        );

        assertTrue(ex.getMessage().contains("999"));
        verify(riskRepository, never()).deleteById(any());
    }

    // ─────────────────────────── бизнес-логика ───────────────────────────

    @Test
    @DisplayName("бизнес: смена уровня риска с Высокий на Низкий — должна сохраниться")
    void updateRisk_ChangeLevel_ShouldPersistLevelChange() {
        Risk levelUpdate = Risk.builder()
                .title("Test Risk")
                .description("description")
                .level("Низкий")
                .status("Активен")
                .build();

        when(riskRepository.findById(1L)).thenReturn(Optional.of(riskEntity));
        when(riskRepository.save(any(RiskEntity.class))).thenAnswer(inv -> {
            RiskEntity e = inv.getArgument(0);
            assertEquals("Низкий", e.getLevel());
            return riskEntity;
        });
        when(riskMapper.toDomain(any())).thenReturn(riskDomain);

        riskService.updateRisk(1L, levelUpdate);

        verify(riskRepository).save(any(RiskEntity.class));
    }
}
