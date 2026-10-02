package com.pmsystem.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Risk {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String level;
    private String status;
}
