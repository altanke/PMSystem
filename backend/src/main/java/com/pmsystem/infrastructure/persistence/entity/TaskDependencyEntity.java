package com.pmsystem.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "task_dependencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDependencyEntity {

    @EmbeddedId
    private TaskDependencyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("predecessorTaskId")
    @JoinColumn(name = "predecessor_task_id")
    @JsonIgnore
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private TaskEntity predecessor;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("successorTaskId")
    @JoinColumn(name = "successor_task_id")
    @JsonIgnore
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private TaskEntity successor;

    @Column(name = "dependency_type", nullable = false)
    private String dependencyType;

    @Column(name = "lag_time_hours")
    private Double lagTimeHours;
}
