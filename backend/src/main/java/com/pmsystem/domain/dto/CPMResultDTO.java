package com.pmsystem.domain.dto;

public record CPMResultDTO(
        Long taskId,
        double earlyStart,
        double earlyFinish,
        double lateStart,
        double lateFinish,
        double slack,
        boolean isCritical,
        String earlyStartDt,
        String earlyFinishDt,
        String lateStartDt,
        String lateFinishDt) {

    public CPMResultDTO(Long taskId, double earlyStart, double earlyFinish,
                        double lateStart, double lateFinish,
                        double slack, boolean isCritical) {
        this(taskId, earlyStart, earlyFinish, lateStart, lateFinish,
                slack, isCritical, null, null, null, null);
    }
}
