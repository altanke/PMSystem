package com.pmsystem.infrastructure.persistence.repository;

import com.pmsystem.infrastructure.persistence.entity.ProjectEntity;
import com.pmsystem.infrastructure.persistence.entity.TaskEntity;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.domain.model.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindTask_Success() {
        UserEntity manager = new UserEntity();
        manager.setUsername("testmanager");
        manager.setEmail("testmanager@example.com");
        manager.setPasswordHash("hashedpassword");
        manager.setRole(Role.MANAGER);
        manager = userRepository.save(manager);

        ProjectEntity project = new ProjectEntity();
        project.setName("Test Project");
        project.setStatus("PLANNED");
        project.setStartDate(java.time.LocalDate.now());
        project.setEndDate(java.time.LocalDate.now().plusDays(7));
        project.setManager(manager);
        project = projectRepository.save(project);

        TaskEntity task = new TaskEntity();
        task.setName("Test Task");
        task.setStatus("TODO");
        task.setPriority("HIGH");
        task.setDurationEstimateHours(10.0);
        task.setProject(project);

        TaskEntity savedTask = taskRepository.save(task);

        assertNotNull(savedTask.getId());

        TaskEntity foundTask = taskRepository.findById(savedTask.getId()).orElse(null);
        assertNotNull(foundTask);
        assertEquals("Test Task", foundTask.getName());
        assertEquals(10.0, foundTask.getDurationEstimateHours());
        assertEquals(project.getId(), foundTask.getProject().getId());
    }
}
