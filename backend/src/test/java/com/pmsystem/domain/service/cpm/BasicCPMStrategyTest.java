package com.pmsystem.domain.service.cpm;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;
import com.pmsystem.domain.exception.CircularDependencyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BasicCPMStrategyTest {

    private BasicCPMStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new BasicCPMStrategy();
    }

    @Test
    void calculate_LinearSequence_ShouldReturnCorrectResults() {
        // A(5) -> B(3) -> C(2)
        TaskNodeDTO nodeA = new TaskNodeDTO(1L, "A", 5.0, List.of(), List.of(2L));
        TaskNodeDTO nodeB = new TaskNodeDTO(2L, "B", 3.0, List.of(1L), List.of(3L));
        TaskNodeDTO nodeC = new TaskNodeDTO(3L, "C", 2.0, List.of(2L), List.of());

        List<CPMResultDTO> results = strategy.calculate(List.of(nodeA, nodeB, nodeC));

        assertThat(results).hasSize(3);

        CPMResultDTO resA = results.stream().filter(r -> r.taskId().equals(1L)).findFirst().get();
        assertThat(resA.earlyStart()).isEqualTo(0.0);
        assertThat(resA.earlyFinish()).isEqualTo(5.0);
        assertThat(resA.slack()).isEqualTo(0.0);
        assertThat(resA.isCritical()).isTrue();

        CPMResultDTO resB = results.stream().filter(r -> r.taskId().equals(2L)).findFirst().get();
        assertThat(resB.earlyStart()).isEqualTo(5.0);
        assertThat(resB.earlyFinish()).isEqualTo(8.0);
        assertThat(resB.slack()).isEqualTo(0.0);
        assertThat(resB.isCritical()).isTrue();

        CPMResultDTO resC = results.stream().filter(r -> r.taskId().equals(3L)).findFirst().get();
        assertThat(resC.earlyFinish()).isEqualTo(10.0);
        assertThat(resC.isCritical()).isTrue();
    }

    @Test
    void calculate_ParallelTasks_ShouldIdentifyCriticalAndNonCriticalPaths() {
        // Start -> A(4) -> C(2) -> Finish (Path 1: length 6)
        // Start -> B(2) -> C(2) -> Finish (Path 2: length 4)
        TaskNodeDTO nodeA = new TaskNodeDTO(1L, "A", 4.0, List.of(), List.of(3L));
        TaskNodeDTO nodeB = new TaskNodeDTO(2L, "B", 2.0, List.of(), List.of(3L));
        TaskNodeDTO nodeC = new TaskNodeDTO(3L, "C", 2.0, List.of(1L, 2L), List.of());

        List<CPMResultDTO> results = strategy.calculate(List.of(nodeA, nodeB, nodeC));

        CPMResultDTO resA = results.stream().filter(r -> r.taskId().equals(1L)).findFirst().get();
        assertThat(resA.isCritical()).isTrue();

        CPMResultDTO resB = results.stream().filter(r -> r.taskId().equals(2L)).findFirst().get();
        assertThat(resB.isCritical()).isFalse();
        assertThat(resB.slack()).isEqualTo(2.0); // 4.0 - 2.0 = 2.0 slack
    }

    @Test
    void calculate_Cycle_ShouldThrowException() {
        // A -> B -> A
        TaskNodeDTO nodeA = new TaskNodeDTO(1L, "A", 2.0, List.of(2L), List.of(2L));
        TaskNodeDTO nodeB = new TaskNodeDTO(2L, "B", 3.0, List.of(1L), List.of(1L));

        assertThatThrownBy(() -> strategy.calculate(List.of(nodeA, nodeB)))
                .isInstanceOf(CircularDependencyException.class)
                .hasMessageContaining("Cycle detected");
    }
}
