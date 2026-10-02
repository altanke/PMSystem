package com.pmsystem.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyDTO implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private Long taskId;
    private String dependencyType;
    private Double lagTimeHours;
}
