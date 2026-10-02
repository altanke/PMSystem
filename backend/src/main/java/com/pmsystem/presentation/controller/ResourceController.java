package com.pmsystem.presentation.controller;

import com.pmsystem.domain.dto.ResourceDto;
import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.ResourceEntity;
import com.pmsystem.infrastructure.persistence.repository.ResourceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Resource management endpoints")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    @Operation(summary = "Get all resources")
    public ResponseEntity<List<ResourceDto>> getAllResources() {
        List<ResourceDto> list = resourceRepository.findAll().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get resources by project")
    public ResponseEntity<List<ResourceDto>> getByProject(@PathVariable Long projectId) {
        List<ResourceDto> list = resourceRepository.findByProjectId(projectId).stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new resource (MANAGER/ADMIN)")
    public ResponseEntity<ResourceDto> createResource(@RequestBody ResourceDto request) {
        if (request.projectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }
        ProjectEntity projectRef = new ProjectEntity();
        projectRef.setId(request.projectId());

        ResourceEntity entity = ResourceEntity.builder()
                .project(projectRef)
                .name(request.name())
                .type(request.type())
                .costPerUnit(request.costPerUnit())
                .build();

        ResourceEntity saved = resourceRepository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete a resource (MANAGER/ADMIN)")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResourceDto toDto(ResourceEntity e) {
        return new ResourceDto(
                e.getId(),
                e.getProject() != null ? e.getProject().getId() : null,
                e.getName(),
                e.getType(),
                e.getCostPerUnit()
        );
    }
}
