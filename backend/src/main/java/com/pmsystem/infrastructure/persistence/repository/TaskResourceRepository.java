package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.TaskResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskResourceRepository extends JpaRepository<TaskResourceEntity, Long> {
    List<TaskResourceEntity> findByTaskId(Long taskId);
}
