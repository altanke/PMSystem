package com.pmsystem.presentation.controller;

import com.pmsystem.application.port.in.ProjectUseCase;
import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.model.Project;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
public class ProjectController {

    private final ProjectUseCase projectUseCase;

    @GetMapping
    @Operation(summary = "Get all projects", description = "Retrieve a paginated list of all projects")
    public ResponseEntity<Page<Project>> getAllProjects(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(projectUseCase.getAllProjects(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieve a specific project by its ID")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "404", description = "Project not found")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectUseCase.getProjectById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new project", description = "Create a project and save it to the database")
    @ApiResponse(responseCode = "201", description = "Project created successfully")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project created = projectUseCase.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update an existing project", description = "Update project details by its ID")
    @ApiResponse(responseCode = "200", description = "Project updated successfully")
    @ApiResponse(responseCode = "404", description = "Project not found")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        return ResponseEntity.ok(projectUseCase.updateProject(id, project));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete a project", description = "Deletes a project and all its tasks, risks, and resources")
    @ApiResponse(responseCode = "204", description = "Project deleted successfully")
    @ApiResponse(responseCode = "404", description = "Project not found")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectUseCase.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/calculate-cpm")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Calculate Critical Path for Project", description = "Calculates the CPM metrics for all tasks in the project and saves the results.")
    @ApiResponse(responseCode = "200", description = "Calculation successful")
    @ApiResponse(responseCode = "404", description = "Project not found")
    public ResponseEntity<List<CPMResultDTO>> calculateAndSaveCriticalPath(@PathVariable Long id) {
        List<CPMResultDTO> results = projectUseCase.calculateAndSaveCriticalPath(id);
        return ResponseEntity.ok(results);
    }
}
