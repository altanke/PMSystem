package com.pmsystem.application.port.in;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectUseCase {

    Page<Project> getAllProjects(Pageable pageable);

    Project getProjectById(Long id);

    Project createProject(Project project);

    Project updateProject(Long id, Project project);

    void deleteProject(Long id);

    List<CPMResultDTO> calculateAndSaveCriticalPath(Long projectId);
}
