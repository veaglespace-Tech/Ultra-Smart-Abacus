package com.example.Abacus.service;

import com.example.Abacus.dto.request.EnquiryRequest;
import com.example.Abacus.dto.response.EnquiryResponse;
import com.example.Abacus.entity.Enquiry;
import com.example.Abacus.repository.EnquiryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;


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

    // Get All Enquiries
    public List<EnquiryResponse> getAllEnquiries() {


        return enquiryRepository.findAll().stream()
                .map(this:: mapToResponse)
                .toList();
    }


    // Get Particular One Enquiry
    public EnquiryResponse getEnquiryById(Long id) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        return mapToResponse(enquiry);
    }

    // Update Enquiry
    public EnquiryResponse updateEnquiry(Long id, @Valid EnquiryRequest request) {

        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        enquiry.setName(request.name());
        enquiry.setEmail(request.email());
        enquiry.setPhone(request.phone());
        enquiry.setMessage(request.message());

        Enquiry updatedEnquiry = enquiryRepository.save(enquiry);

        return new EnquiryResponse(
                updatedEnquiry.getId(),
                updatedEnquiry.getName(),
                updatedEnquiry.getEmail(),
                updatedEnquiry.getPhone(),
                updatedEnquiry.getMessage(),
                updatedEnquiry.getStatus(),
                updatedEnquiry.getCreatedAt()
        );
    }

    private EnquiryResponse mapToResponse(Enquiry enquiry){

       return new EnquiryResponse(
                enquiry.getId(),
                enquiry.getName(),
                enquiry.getEmail(),
                enquiry.getPhone(),
                enquiry.getMessage(),
                enquiry.getStatus(),
                enquiry.getCreatedAt()
        );
    }


}
