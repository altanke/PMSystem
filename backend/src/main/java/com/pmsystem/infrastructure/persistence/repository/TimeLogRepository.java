package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.TimeLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLogEntity, Long> {
    List<TimeLogEntity> findByTaskId(Long taskId);
    List<TimeLogEntity> findByUserId(Long userId);
}
