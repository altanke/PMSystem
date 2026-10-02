package com.pmsystem.infrastructure.persistence.mapper;

import com.pmsystem.domain.model.Task;
import com.pmsystem.domain.dto.TaskDependencyDTO;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TaskMapper {

    public Task toDomain(TaskEntity entity) {
        if (entity == null) {
            return null;
        }

        Task task = Task.builder()
                .id(entity.getId())
                .projectId(entity.getProject() != null ? entity.getProject().getId() : null)
                .name(entity.getName())
                .description(entity.getDescription())
                .assigneeId(entity.getAssignee() != null ? entity.getAssignee().getId() : null)
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .durationEstimateHours(
                        entity.getDurationEstimateHours() != null ? entity.getDurationEstimateHours() : 0.0)
                .earlyStart(entity.getEarlyStart())
                .earlyFinish(entity.getEarlyFinish())
                .lateStart(entity.getLateStart())
                .lateFinish(entity.getLateFinish())
                .slack(entity.getSlack())
                .isCritical(entity.getIsCritical())
                .earlyStartDt(entity.getEarlyStartDt())
                .earlyFinishDt(entity.getEarlyFinishDt())
                .lateStartDt(entity.getLateStartDt())
                .lateFinishDt(entity.getLateFinishDt())
                .build();

        if (entity.getPredecessors() != null) {
            List<TaskDependencyDTO> preds = entity.getPredecessors().stream()
                    .map(dep -> new TaskDependencyDTO(
                            dep.getPredecessor().getId(),
                            dep.getDependencyType(),
                            dep.getLagTimeHours()
                    ))
                    .collect(Collectors.toList());
            task.setPredecessors(preds);
        }

        if (entity.getSuccessors() != null) {
            List<TaskDependencyDTO> succs = entity.getSuccessors().stream()
                    .map(dep -> new TaskDependencyDTO(
                            dep.getSuccessor().getId(),
                            dep.getDependencyType(),
                            dep.getLagTimeHours()
                    ))
                    .collect(Collectors.toList());
            task.setSuccessors(succs);
        }

        return task;
    }

    public TaskEntity toEntity(Task domain) {
        if (domain == null) {
            return null;
        }

        TaskEntity entity = new TaskEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setStatus(domain.getStatus());
        entity.setPriority(domain.getPriority());
        entity.setDurationEstimateHours(domain.getDurationEstimateHours());
        entity.setEarlyStart(domain.getEarlyStart());
        entity.setEarlyFinish(domain.getEarlyFinish());
        entity.setLateStart(domain.getLateStart());
        entity.setLateFinish(domain.getLateFinish());
        entity.setSlack(domain.getSlack());
        entity.setIsCritical(domain.getIsCritical());
        entity.setEarlyStartDt(domain.getEarlyStartDt());
        entity.setEarlyFinishDt(domain.getEarlyFinishDt());
        entity.setLateStartDt(domain.getLateStartDt());
        entity.setLateFinishDt(domain.getLateFinishDt());

        return entity;
    }
}
