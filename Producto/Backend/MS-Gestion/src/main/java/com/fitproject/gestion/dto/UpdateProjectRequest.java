package com.fitproject.gestion.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProjectRequest {
    private String description;
    private String imageUrl;
    private Double budget;
}
