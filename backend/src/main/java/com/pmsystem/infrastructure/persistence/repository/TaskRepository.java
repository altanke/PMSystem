package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.predecessors " +
           "LEFT JOIN FETCH t.successors " +
           "WHERE t.project.id = :projectId")
    List<TaskEntity> findAllByProjectIdWithDependencies(@Param("projectId") Long projectId);

    @EntityGraph(value = "TaskEntity.withDependencies", type = EntityGraph.EntityGraphType.LOAD)
    List<TaskEntity> findByProjectId(Long projectId);
}
