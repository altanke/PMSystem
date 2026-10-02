package com.pmsystem.application.port.in;

import com.pmsystem.domain.model.Risk;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RiskUseCase {
    Page<Risk> getAllRisks(Pageable pageable);

    Page<Risk> getRisksByProject(Long projectId, Pageable pageable);

    Risk getRiskById(Long id);

    Risk createRisk(Long projectId, Risk risk);

    Risk updateRisk(Long id, Risk risk);

    void deleteRisk(Long id);
}
