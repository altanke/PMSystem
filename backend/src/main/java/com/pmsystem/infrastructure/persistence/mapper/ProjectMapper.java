package com.pmsystem.infrastructure.persistence.mapper;

import com.pmsystem.domain.model.Project;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = { TaskMapper.class })
public interface ProjectMapper {

    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "progressPercentage", expression = "java(calculateProgressPercentage(entity))")
    @Mapping(target = "totalBudget", expression = "java(calculateTotalBudget(entity))")
    @Mapping(target = "participantIds", expression = "java(mapParticipantIds(entity))")
    Project toDomain(ProjectEntity entity);

    default Integer calculateProgressPercentage(ProjectEntity entity) {
        if (entity.getTasks() == null || entity.getTasks().isEmpty()) {
            return 0;
        }
        long doneCount = entity.getTasks().stream()
                .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()))
                .count();
        int total = entity.getTasks().size();
        return (int) Math.round((double) doneCount / total * 100);
    }

    default java.math.BigDecimal calculateTotalBudget(ProjectEntity entity) {
        if (entity.getResources() == null || entity.getResources().isEmpty()) {
            return java.math.BigDecimal.ZERO;
        }
        return entity.getResources().stream()
                .map(com.pmsystem.infrastructure.persistence.entity.ResourceEntity::getCostPerUnit)
                .filter(java.util.Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

    default Set<Long> mapParticipantIds(ProjectEntity entity) {
        if (entity.getParticipants() == null) return Set.of();
        return entity.getParticipants().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
    }

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "resources", ignore = true)
    @Mapping(target = "risks", ignore = true)
    @Mapping(target = "participants", ignore = true)
    ProjectEntity toEntity(Project domain);
}
