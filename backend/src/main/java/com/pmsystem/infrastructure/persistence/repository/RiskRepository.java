package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.RiskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskRepository extends JpaRepository<RiskEntity, Long> {
    Page<RiskEntity> findByProjectId(Long projectId, Pageable pageable);
    List<RiskEntity> findByProjectId(Long projectId);
}
