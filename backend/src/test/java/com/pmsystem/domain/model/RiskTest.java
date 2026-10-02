package com.pmsystem.domain.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class RiskTest {

    @Test
    void shouldCreateAndAccessRisk() {
        Risk risk = new Risk();
        risk.setId(1L);
        risk.setProjectId(2L);
        risk.setTitle("Title");
        risk.setDescription("Desc");
        risk.setLevel("HIGH");
        risk.setStatus("OPEN");

        assertThat(risk.getId()).isEqualTo(1L);
        assertThat(risk.getProjectId()).isEqualTo(2L);
        assertThat(risk.getTitle()).isEqualTo("Title");
        assertThat(risk.getDescription()).isEqualTo("Desc");
        assertThat(risk.getLevel()).isEqualTo("HIGH");
        assertThat(risk.getStatus()).isEqualTo("OPEN");

        Risk builderRisk = Risk.builder()
                .id(1L)
                .projectId(2L)
                .title("Title")
                .description("Desc")
                .level("HIGH")
                .status("OPEN")
                .build();
        
        assertThat(risk.toString()).hasToString(builderRisk.toString());
        assertThat(risk.hashCode()).isEqualTo(builderRisk.hashCode());
        assertThat(risk.equals(builderRisk)).isTrue();
    }
}
