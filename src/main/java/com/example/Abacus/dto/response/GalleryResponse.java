package com.example.Abacus.dto.response;

import java.time.LocalDateTime;

public record GalleryResponse(

        Long id,
        String title,
        String description,
        String imageUrl,
        Boolean active,
        LocalDateTime createdAt

) {
}