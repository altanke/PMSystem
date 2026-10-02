package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.ResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<ResourceEntity, Long> {
    List<ResourceEntity> findByProjectId(Long projectId);
}
