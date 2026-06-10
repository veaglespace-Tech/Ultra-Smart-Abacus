package com.example.Abacus.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GalleryRequest(

        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotBlank(message = "Image URL is required")
        String imageUrl,

        Boolean active

) {
}