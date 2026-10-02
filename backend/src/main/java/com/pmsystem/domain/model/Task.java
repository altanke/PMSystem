package com.pmsystem.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.pmsystem.domain.dto.TaskDependencyDTO;

@Getter
@Setter
@Builder
public class Task implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private Long assigneeId;
    private String status;
    private String priority;

    private double durationEstimateHours;

    private Double earlyStart;
    private Double earlyFinish;
    private Double lateStart;
    private Double lateFinish;
    private Double slack;
    private Boolean isCritical;

    private LocalDateTime earlyStartDt;
    private LocalDateTime earlyFinishDt;
    private LocalDateTime lateStartDt;
    private LocalDateTime lateFinishDt;

    @Builder.Default
    private List<TaskDependencyDTO> predecessors = new ArrayList<>();

    @Builder.Default
    private List<TaskDependencyDTO> successors = new ArrayList<>();

    public void addPredecessor(TaskDependencyDTO dependency) {
        this.predecessors.add(dependency);
    }

    public void addSuccessor(TaskDependencyDTO dependency) {
        this.successors.add(dependency);
    }
}
