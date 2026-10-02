package com.pmsystem.domain.dto;

import java.math.BigDecimal;

public record ResourceDto(
        Long id,
        Long projectId,
        String name,
        String type,
        BigDecimal costPerUnit
) {}
