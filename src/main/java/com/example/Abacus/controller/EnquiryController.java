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

     // GET ALL
    @GetMapping
    public ResponseEntity<List<EnquiryResponse>> getAllEnquiries() {
        return ResponseEntity.ok(
                enquiryService.getAllEnquiries()
        );
    }


}