package com.pmsystem.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyId implements Serializable {

    @Column(name = "predecessor_task_id")
    private Long predecessorTaskId;

    @Column(name = "successor_task_id")
    private Long successorTaskId;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        TaskDependencyId that = (TaskDependencyId) o;
        return Objects.equals(predecessorTaskId, that.predecessorTaskId)
                && Objects.equals(successorTaskId, that.successorTaskId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(predecessorTaskId, successorTaskId);
    }
}
