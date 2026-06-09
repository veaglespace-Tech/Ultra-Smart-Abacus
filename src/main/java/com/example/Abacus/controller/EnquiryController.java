package com.example.Abacus.controller;

import com.example.Abacus.dto.request.EnquiryRequest;
import com.example.Abacus.dto.response.EnquiryResponse;
import com.example.Abacus.service.EnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService enquiryService;


    @GetMapping
    public String hello(){
        return "Hello...";
    }

    //  Create
    @PostMapping
    public ResponseEntity<String> createEnquiry(
            @Valid @RequestBody EnquiryRequest request) {

        enquiryService.createEnquiry(request);

        return ResponseEntity.ok("Enquiry submitted successfully");
    }

    // Get all 
    public ResponseEntity<List<EnquiryResponse>> getAll() {

        return ResponseEntity.ok(
                enquiryService.getAllEnquiries()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnquiryResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                enquiryService.getEnquiryById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnquiryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EnquiryRequest request) {

        return ResponseEntity.ok(
                enquiryService.updateEnquiry(id, request)
        );
    }

}