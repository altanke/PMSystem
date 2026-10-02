package com.pmsystem.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@NamedEntityGraph(name = "TaskEntity.withDependencies", attributeNodes = {
        @NamedAttributeNode("predecessors"),
        @NamedAttributeNode("successors")
})
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private ProjectEntity project;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private UserEntity assignee;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String priority;

    @Column(name = "duration_estimate_hours")
    private Double durationEstimateHours;

    @Column(name = "actual_start_date")
    private LocalDateTime actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDateTime actualEndDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "early_start")
    private Double earlyStart;

    @Column(name = "early_finish")
    private Double earlyFinish;

    @Column(name = "late_start")
    private Double lateStart;

    @Column(name = "late_finish")
    private Double lateFinish;

    @Column(name = "slack")
    private Double slack;

    @Column(name = "is_critical")
    private Boolean isCritical;

    @Column(name = "early_start_dt")
    private LocalDateTime earlyStartDt;

    @Column(name = "early_finish_dt")
    private LocalDateTime earlyFinishDt;

    @Column(name = "late_start_dt")
    private LocalDateTime lateStartDt;

    @Column(name = "late_finish_dt")
    private LocalDateTime lateFinishDt;

    @OneToMany(mappedBy = "successor", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private java.util.Set<TaskDependencyEntity> predecessors = new java.util.HashSet<>();

    @OneToMany(mappedBy = "predecessor", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private java.util.Set<TaskDependencyEntity> successors = new java.util.HashSet<>();
}
