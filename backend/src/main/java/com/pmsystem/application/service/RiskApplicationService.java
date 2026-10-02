package com.pmsystem.application.service;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.application.port.in.RiskUseCase;
import com.pmsystem.domain.model.Risk;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.RiskEntity;
import com.pmsystem.infrastructure.persistence.mapper.RiskMapper;
import com.pmsystem.infrastructure.persistence.repository.ProjectRepository;
import com.pmsystem.infrastructure.persistence.repository.RiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RiskApplicationService implements RiskUseCase {

    private final RiskRepository riskRepository;
    private final ProjectRepository projectRepository;
    private final RiskMapper riskMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<Risk> getAllRisks(Pageable pageable) {
        return riskRepository.findAll(pageable)
                .map(riskMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Risk> getRisksByProject(Long projectId, Pageable pageable) {
        return riskRepository.findByProjectId(projectId, pageable)
                .map(riskMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Risk getRiskById(Long id) {
        return riskRepository.findById(id)
                .map(riskMapper::toDomain)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found with id: " + id));
    }

    @Override
    @Transactional
    public Risk createRisk(Long projectId, Risk risk) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        RiskEntity entity = riskMapper.toEntity(risk);
        entity.setProject(project);

        if (entity.getStatus() == null) {
            entity.setStatus("Активен");
        }

        return riskMapper.toDomain(riskRepository.save(entity));
    }

    @Override
    @Transactional
    public Risk updateRisk(Long id, Risk risk) {
        RiskEntity entity = riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found with id: " + id));

        entity.setTitle(risk.getTitle());
        entity.setDescription(risk.getDescription());
        entity.setLevel(risk.getLevel());

        if (risk.getStatus() != null) {
            entity.setStatus(risk.getStatus());
        }

        return riskMapper.toDomain(riskRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteRisk(Long id) {
        if (!riskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Risk not found with id: " + id);
        }
        riskRepository.deleteById(id);
    }
}
