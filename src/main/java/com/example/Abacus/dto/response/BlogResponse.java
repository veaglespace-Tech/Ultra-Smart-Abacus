package com.example.Abacus.dto.response;

import java.time.LocalDateTime;

public record BlogResponse(
        Long id,
        String title,
        String content,
        String imageUrl,
        Boolean published,
        LocalDateTime createdAt
) {}