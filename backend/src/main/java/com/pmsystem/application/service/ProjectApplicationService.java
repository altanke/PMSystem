package com.pmsystem.application.service;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.application.port.in.ProjectUseCase;
import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;
import com.pmsystem.domain.model.Role;
import com.pmsystem.domain.service.CPMService;
import com.pmsystem.infrastructure.persistence.mapper.ProjectMapper;
import com.pmsystem.infrastructure.persistence.mapper.TaskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.TaskRepository;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectApplicationService implements ProjectUseCase {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final ProjectMapper projectMapper;
    private final CPMService cpmService;
    private final WorkCalendarScheduler workCalendarScheduler;

    @Override
    @Transactional(readOnly = true)
    public Page<com.pmsystem.domain.model.Project> getAllProjects(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            String email = authentication.getName();
            UserEntity currentUser = userRepository.findByEmail(email).orElse(null);
            if (currentUser != null && currentUser.getRole() == Role.USER) {
                return projectRepository.findProjectsVisibleToUser(currentUser.getId(), pageable)
                        .map(projectMapper::toDomain);
            }
        }
        return projectRepository.findAll(pageable).map(projectMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public com.pmsystem.domain.model.Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(projectMapper::toDomain)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    @Override
    @Transactional
    public com.pmsystem.domain.model.Project createProject(com.pmsystem.domain.model.Project project) {
        ProjectEntity entity = projectMapper.toEntity(project);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            String email = authentication.getName();
            UserEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            entity.setManager(user);
        } else {
            throw new IllegalStateException("Cannot create project without authenticated user");
        }

        if (entity.getStartDate() == null) {
            entity.setStartDate(LocalDate.now());
        }
        if (entity.getStatus() == null) {
            entity.setStatus("PLANNED");
        }

        if (project.getParticipantIds() != null && !project.getParticipantIds().isEmpty()) {
            Set<UserEntity> participants = new HashSet<>(
                    userRepository.findAllById(project.getParticipantIds()));
            entity.setParticipants(participants);
        }

        entity = projectRepository.save(entity);
        return projectMapper.toDomain(entity);
    }

    @Override
    @Transactional
    public com.pmsystem.domain.model.Project updateProject(Long id, com.pmsystem.domain.model.Project project) {
        ProjectEntity entity = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (project.getName() != null) {
            entity.setName(project.getName());
        }
        if (project.getDescription() != null) {
            entity.setDescription(project.getDescription());
        }
        if (project.getStartDate() != null) {
            entity.setStartDate(project.getStartDate());
        }
        if (project.getEndDate() != null) {
            entity.setEndDate(project.getEndDate());
        }
        if (project.getStatus() != null) {
            entity.setStatus(project.getStatus());
        }

        entity.setPublicAccess(project.isPublicAccess());

        if (project.getParticipantIds() != null) {
            Set<UserEntity> participants = new HashSet<>(
                    userRepository.findAllById(project.getParticipantIds()));
            entity.setParticipants(participants);
        }

        return projectMapper.toDomain(projectRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
        log.info("Deleted project ID: {} (tasks, risks and resources deleted cascadingly)", id);
    }

    @Override
    @Transactional
    public List<CPMResultDTO> calculateAndSaveCriticalPath(Long projectId) {
        log.info("Starting CPM calculation for project ID: {}", projectId);

        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<TaskEntity> taskEntities = taskRepository.findAllByProjectIdWithDependencies(projectId);

        if (taskEntities.isEmpty()) {
            log.warn("No tasks found for project ID: {}", projectId);
            return List.of();
        }

        List<TaskNodeDTO> nodeDTOs = taskEntities.stream()
                .map(entity -> {
                    com.pmsystem.domain.model.Task domainTask = taskMapper.toDomain(entity);
                    return new TaskNodeDTO(
                            domainTask.getId(),
                            domainTask.getName(),
                            domainTask.getDurationEstimateHours(),
                            domainTask.getPredecessors().stream()
                                    .map(com.pmsystem.domain.dto.TaskDependencyDTO::getTaskId)
                                    .collect(Collectors.toList()),
                            domainTask.getSuccessors().stream()
                                    .map(com.pmsystem.domain.dto.TaskDependencyDTO::getTaskId)
                                    .collect(Collectors.toList()));
                })
                .collect(Collectors.toList());

        try {

            log.debug("Delegating calculation to domain service for {} tasks", nodeDTOs.size());
            List<CPMResultDTO> results = cpmService.executeCalculation(nodeDTOs);

            ProjectEntity projectEntity = projectRepository.findById(projectId).orElseThrow();
            LocalDate projectStartDate = projectEntity.getStartDate() != null
                    ? projectEntity.getStartDate() : LocalDate.now();

            List<CPMResultDTO> enrichedResults = results.stream().map(r -> {
                LocalDateTime es = workCalendarScheduler.offsetToDatetime(projectStartDate, r.earlyStart());
                LocalDateTime ef = workCalendarScheduler.offsetToDatetime(projectStartDate, r.earlyFinish());
                LocalDateTime ls = workCalendarScheduler.offsetToDatetime(projectStartDate, r.lateStart());
                LocalDateTime lf = workCalendarScheduler.offsetToDatetime(projectStartDate, r.lateFinish());
                return new CPMResultDTO(
                        r.taskId(), r.earlyStart(), r.earlyFinish(),
                        r.lateStart(), r.lateFinish(), r.slack(), r.isCritical(),
                        es.toString(), ef.toString(), ls.toString(), lf.toString());
            }).collect(Collectors.toList());

            Map<Long, TaskEntity> entityMap = taskEntities.stream()
                    .collect(Collectors.toMap(TaskEntity::getId, Function.identity()));
            Map<Long, CPMResultDTO> enrichedMap = enrichedResults.stream()
                    .collect(Collectors.toMap(CPMResultDTO::taskId, r -> r));

            for (CPMResultDTO result : results) {
                TaskEntity entity = entityMap.get(result.taskId());
                if (entity != null) {
                    entity.setEarlyStart(result.earlyStart());
                    entity.setEarlyFinish(result.earlyFinish());
                    entity.setLateStart(result.lateStart());
                    entity.setLateFinish(result.lateFinish());
                    entity.setSlack(result.slack());
                    entity.setIsCritical(result.isCritical());
                    CPMResultDTO enriched = enrichedMap.get(result.taskId());
                    if (enriched != null) {
                        entity.setEarlyStartDt(enriched.earlyStartDt() != null ? LocalDateTime.parse(enriched.earlyStartDt()) : null);
                        entity.setEarlyFinishDt(enriched.earlyFinishDt() != null ? LocalDateTime.parse(enriched.earlyFinishDt()) : null);
                        entity.setLateStartDt(enriched.lateStartDt() != null ? LocalDateTime.parse(enriched.lateStartDt()) : null);
                        entity.setLateFinishDt(enriched.lateFinishDt() != null ? LocalDateTime.parse(enriched.lateFinishDt()) : null);
                    }
                }
            }

            taskRepository.saveAll(taskEntities);
            log.info("Successfully calculated and saved CPM for project ID: {}. Critical path involves {} tasks.",
                    projectId,
                    enrichedResults.stream().filter(CPMResultDTO::isCritical).count());

            return enrichedResults;
        } catch (Exception e) {
            log.error("Error calculating CPM for project ID: {}", projectId, e);
            throw new RuntimeException("Error calculating CPM: " + e.getMessage(), e);
        }
    }
}
