package com.example.Abacus.service;

import com.example.Abacus.dto.request.EnquiryRequest;
import com.example.Abacus.entity.Enquiry;
import com.example.Abacus.repository.EnquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EnquiryService {


    private final EnquiryRepository enquiryRepository;

// Save Enquiry
    public void createEnquiry(EnquiryRequest request) {

        Enquiry enquiry = Enquiry.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .message(request.message())
                .build();

        enquiryRepository.save(enquiry);
    }


    



}
