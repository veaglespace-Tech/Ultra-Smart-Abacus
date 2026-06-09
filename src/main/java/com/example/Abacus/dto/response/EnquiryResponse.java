package com.example.Abacus.dto.response;

import com.example.Abacus.enums.EnquiryStatus;

import java.time.LocalDateTime;

public record EnquiryResponse(

        Long id,
        String name,
        String email,
        String phone,
        String message,
        EnquiryStatus status,
        LocalDateTime createdAt

) {
}