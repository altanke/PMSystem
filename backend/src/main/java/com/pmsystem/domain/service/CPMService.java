package com.pmsystem.domain.service;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;
import com.pmsystem.domain.service.cpm.CPMStrategy;

import java.util.List;

public class CPMService {

    private final CPMStrategy strategy;

    public CPMService(CPMStrategy strategy) {
        this.strategy = strategy;
    }

    public List<CPMResultDTO> executeCalculation(List<TaskNodeDTO> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return List.of();
        }
        return strategy.calculate(tasks);
    }
}
