package com.pmsystem.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
public class Project implements java.io.Serializable {
    private static final long serialVersionUID = 2L;
    private Long id;
    private String name;
    private String description;
    private Long managerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean publicAccess;
    private Integer progressPercentage;
    private BigDecimal totalBudget;
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();
    @Builder.Default
    private Set<Long> participantIds = new HashSet<>();

    public void addTask(Task task) {
        this.tasks.add(task);
    }
}
