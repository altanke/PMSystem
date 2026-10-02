package com.pmsystem.presentation.controller;

import com.pmsystem.application.port.in.RiskUseCase;
import com.pmsystem.domain.dto.RiskDto;
import com.pmsystem.domain.model.Risk;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class RiskControllerTest {

    @Mock
    private RiskUseCase riskUseCase;

    @InjectMocks
    private RiskController riskController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllRisks_ReturnsPageOfRiskDtos() {
        Risk risk = Risk.builder().id(1L).projectId(1L).title("Test").build();
        Page<Risk> page = new PageImpl<>(List.of(risk));
        when(riskUseCase.getAllRisks(any())).thenReturn(page);

        ResponseEntity<Page<RiskDto>> response = riskController.getAllRisks(PageRequest.of(0, 10));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getContent()).hasSize(1);
        assertThat(response.getBody().getContent().get(0).title()).isEqualTo("Test");
    }

    @Test
    void createRisk_WithoutProjectId_ThrowsException() {
        RiskDto dto = new RiskDto(null, null, "Title", "Desc", "Level", "Status");
        assertThatThrownBy(() -> riskController.createRisk(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createRisk_WithProjectId_ReturnsCreated() {
        RiskDto dto = new RiskDto(null, 1L, "Title", "Desc", "Level", "Status");
        Risk saved = Risk.builder().id(1L).projectId(1L).title("Title").build();
        when(riskUseCase.createRisk(eq(1L), any())).thenReturn(saved);

        ResponseEntity<RiskDto> response = riskController.createRisk(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().id()).isEqualTo(1L);
    }

    @Test
    void updateRisk_ReturnsUpdated() {
        RiskDto dto = new RiskDto(null, 1L, "Updated", "Desc", "Level", "Status");
        Risk updated = Risk.builder().id(2L).projectId(1L).title("Updated").build();
        when(riskUseCase.updateRisk(eq(2L), any())).thenReturn(updated);

        ResponseEntity<RiskDto> response = riskController.updateRisk(2L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().title()).isEqualTo("Updated");
    }

    @Test
    void deleteRisk_ReturnsNoContent() {
        doNothing().when(riskUseCase).deleteRisk(1L);
        ResponseEntity<Void> response = riskController.deleteRisk(1L);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(riskUseCase).deleteRisk(1L);
    }
}
