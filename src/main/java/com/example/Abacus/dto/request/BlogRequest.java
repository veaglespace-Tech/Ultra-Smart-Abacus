package com.example.Abacus.dto.request;

public record BlogRequest(
        String title,
        String content,
        String imageUrl,
        Boolean published
) {}
