package com.pmsystem.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "task_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResourceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ResourceEntity resource;

    @Column(name = "allocated_quantity", nullable = false)
    private Double allocatedQuantity;
}
