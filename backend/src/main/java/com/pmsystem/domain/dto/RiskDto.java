package com.pmsystem.domain.dto;

public record RiskDto(
    Long id,
    Long projectId,
    String title,
    String description,
    String level,
    String status
) {}
