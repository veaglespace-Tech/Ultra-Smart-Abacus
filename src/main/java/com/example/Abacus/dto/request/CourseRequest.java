package com.example.Abacus.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CourseRequest(

        @NotBlank(message = "Course name is required")
        String name,

        String description,

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 month")
        Integer durationInMonths,

        @NotNull(message = "Fees is required")
        @Min(value = 0, message = "Fees cannot be negative")
        Double fees,

        Boolean active

) {}