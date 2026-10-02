package com.pmsystem.domain.service.cpm;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;

import java.util.List;

public interface CPMStrategy {

    List<CPMResultDTO> calculate(List<TaskNodeDTO> tasks);
}
