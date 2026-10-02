package com.pmsystem.application.service;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.application.port.in.TaskUseCase;
import com.pmsystem.domain.model.Task;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import com.pmsystem.infrastructure.persistence.mapper.TaskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.TaskRepository;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.TaskDependencyEntity;
import com.pmsystem.infrastructure.persistence.entity.TaskDependencyId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskApplicationService implements TaskUseCase {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(taskMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .map(taskMapper::toDomain)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Task createTask(Task task) {
        if (task.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID is required to create a task");
        }

        ProjectEntity project = projectRepository.findById(task.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + task.getProjectId()));

        TaskEntity entity = taskMapper.toEntity(task);
        entity.setProject(project);
        if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
            entity.setStatus("TODO");
        }

        TaskEntity savedEntity = taskRepository.save(entity);

        if (task.getPredecessors() != null && !task.getPredecessors().isEmpty()) {
            List<Long> predIds = task.getPredecessors().stream()
                    .map(dep -> dep.getTaskId())
                    .collect(Collectors.toList());
            List<TaskEntity> predecessorEntities = taskRepository.findAllById(predIds);
            final TaskEntity finalSavedEntity = savedEntity;
            java.util.Set<TaskDependencyEntity> dependencies = predecessorEntities.stream().map(pred -> {
                TaskDependencyEntity dep = new TaskDependencyEntity();
                dep.setId(new TaskDependencyId(pred.getId(), finalSavedEntity.getId()));
                dep.setPredecessor(pred);
                dep.setSuccessor(finalSavedEntity);
                dep.setDependencyType("FINISH_TO_START");
                dep.setLagTimeHours(0.0);
                return dep;
            }).collect(Collectors.toSet());
            savedEntity.setPredecessors(dependencies);
            savedEntity = taskRepository.save(savedEntity);
        }

        return taskMapper.toDomain(savedEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Task updateTask(Long id, Task task) {
        TaskEntity entity = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        entity.setName(task.getName());
        entity.setDescription(task.getDescription());
        entity.setStatus(task.getStatus());
        entity.setPriority(task.getPriority());
        entity.setDurationEstimateHours(task.getDurationEstimateHours());

        return taskMapper.toDomain(taskRepository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public void deleteTask(Long id) {
        TaskEntity entity = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        entity.getPredecessors().clear();
        entity.getSuccessors().clear();
        taskRepository.save(entity);

        taskRepository.delete(entity);
        log.info("Deleted task ID: {}", id);
    }
}
