package com.pmsystem.domain.dto;

import java.util.List;

public record TaskNodeDTO(
                Long id,
                String name,
                double duration,
                List<Long> predecessors,
                List<Long> successors) {
}
