package com.example.Abacus.dto.response;

import java.time.LocalDateTime;

public record CourseResponse(

        Long id,
        String name,
        String description,
        Integer durationInMonths,
        Double fees,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}