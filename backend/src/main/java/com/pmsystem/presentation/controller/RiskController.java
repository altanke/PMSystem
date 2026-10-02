package com.pmsystem.presentation.controller;

import com.pmsystem.application.port.in.RiskUseCase;
import com.pmsystem.domain.dto.RiskDto;
import com.pmsystem.domain.model.Risk;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/risks")
@RequiredArgsConstructor
@Tag(name = "Risks", description = "Risk management endpoints")
public class RiskController {

    private final RiskUseCase riskUseCase;

    @GetMapping
    @Operation(summary = "Get all risks")
    public ResponseEntity<Page<RiskDto>> getAllRisks(Pageable pageable) {
        Page<RiskDto> risks = riskUseCase.getAllRisks(pageable)
                .map(this::toDto);
        return ResponseEntity.ok(risks);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new risk (MANAGER/ADMIN)")
    public ResponseEntity<RiskDto> createRisk(@RequestBody RiskDto request) {
        if (request.projectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }
        Risk risk = Risk.builder()
                .title(request.title())
                .description(request.description())
                .level(request.level())
                .status(request.status())
                .build();
        Risk saved = riskUseCase.createRisk(request.projectId(), risk);
        return ResponseEntity.ok(toDto(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update an existing risk (MANAGER/ADMIN)")
    public ResponseEntity<RiskDto> updateRisk(
            @PathVariable Long id,
            @RequestBody RiskDto request) {
        Risk riskUpdate = Risk.builder()
                .title(request.title())
                .description(request.description())
                .level(request.level())
                .status(request.status())
                .build();
        Risk updated = riskUseCase.updateRisk(id, riskUpdate);
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete a risk (MANAGER/ADMIN)")
    public ResponseEntity<Void> deleteRisk(@PathVariable Long id) {
        riskUseCase.deleteRisk(id);
        return ResponseEntity.noContent().build();
    }

    private RiskDto toDto(Risk domain) {
        return new RiskDto(
                domain.getId(),
                domain.getProjectId(),
                domain.getTitle(),
                domain.getDescription(),
                domain.getLevel(),
                domain.getStatus()
        );
    }
}
