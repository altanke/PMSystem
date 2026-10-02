package com.pmsystem.domain.service.cpm;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RiskAdjustedCPMStrategyTest {

    @Test
    void calculate_AppliesRiskMultiplierBeforeCallingBaseStrategy() {
        CPMStrategy mockBaseStrategy = Mockito.mock(CPMStrategy.class);
        RiskAdjustedCPMStrategy strategy = new RiskAdjustedCPMStrategy(mockBaseStrategy, 1.5);

        TaskNodeDTO node = new TaskNodeDTO(1L, "Task", 10.0, List.of(), List.of());
        
        when(mockBaseStrategy.calculate(any())).thenReturn(List.of(
                new CPMResultDTO(1L, 0, 15, 0, 15, 0, true)
        ));

        List<CPMResultDTO> result = strategy.calculate(List.of(node));
        
        assertThat(result).hasSize(1);
        verify(mockBaseStrategy).calculate(Mockito.argThat(list -> {
            TaskNodeDTO adjustedNode = (TaskNodeDTO) list.get(0);
            return adjustedNode.duration() == 15.0; // 10.0 * 1.5
        }));
    }
}
