package com.pmsystem.domain.service.cpm;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;

import java.util.List;
import java.util.stream.Collectors;

public class RiskAdjustedCPMStrategy implements CPMStrategy {

    private final CPMStrategy baseStrategy;
    private final double riskBufferMultiplier;

    public RiskAdjustedCPMStrategy(CPMStrategy baseStrategy, double riskBufferMultiplier) {
        this.baseStrategy = baseStrategy;
        this.riskBufferMultiplier = riskBufferMultiplier;
    }

    @Override
    public List<CPMResultDTO> calculate(List<TaskNodeDTO> tasks) {

        List<TaskNodeDTO> adjustedTasks = tasks.stream()
                .map(t -> new TaskNodeDTO(
                        t.id(),
                        t.name(),
                        t.duration() * riskBufferMultiplier,
                        t.predecessors(),
                        t.successors()))
                .collect(Collectors.toList());

        return baseStrategy.calculate(adjustedTasks);
    }
}
