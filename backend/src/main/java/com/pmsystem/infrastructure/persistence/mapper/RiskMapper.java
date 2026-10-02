package com.pmsystem.infrastructure.persistence.mapper;

import com.pmsystem.domain.model.Risk;
import com.pmsystem.infrastructure.persistence.entity.RiskEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RiskMapper {

    @Mapping(target = "projectId", source = "project.id")
    Risk toDomain(RiskEntity entity);

    @Mapping(target = "project", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    RiskEntity toEntity(Risk domain);
}
