package com.pmsystem.application.port.in;

import com.pmsystem.domain.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskUseCase {

    Page<Task> getAllTasks(Pageable pageable);

    Task getTaskById(Long id);

    Task createTask(Task task);

    Task updateTask(Long id, Task task);

    void deleteTask(Long id);
}
