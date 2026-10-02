package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    List<ProjectEntity> findByManagerId(Long managerId);

    @Query("""
        SELECT DISTINCT p FROM ProjectEntity p
        LEFT JOIN p.participants pp
        LEFT JOIN p.tasks t
        WHERE p.publicAccess = true
           OR pp.id = :userId
           OR t.assignee.id = :userId
        """)
    Page<ProjectEntity> findProjectsVisibleToUser(@Param("userId") Long userId, Pageable pageable);
}
