package com.example.Abacus.controller;

import com.example.Abacus.dto.request.GalleryRequest;
import com.example.Abacus.dto.response.GalleryResponse;
import com.example.Abacus.service.GalleryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @PostMapping("/api/admin/gallery")
    public GalleryResponse createGallery(
            @RequestBody @Valid GalleryRequest request) {

        return galleryService.createGallery(request);
    }

    @GetMapping("/api/public/gallery")
    public List<GalleryResponse> getActiveGallery() {
        return galleryService.getActiveGallery();
    }

    @GetMapping("/api/public/gallery/all")
    public List<GalleryResponse> getAllGallery() {
        return galleryService.getAllGallery();
    }

    @GetMapping("/api/public/gallery/{id}")
    public GalleryResponse getGalleryById(
            @PathVariable Long id) {

        return galleryService.getGalleryById(id);
    }

    @PutMapping("/api/admin/gallery/{id}")
    public GalleryResponse updateGallery(
            @PathVariable Long id,
            @RequestBody @Valid GalleryRequest request) {

        return galleryService.updateGallery(id, request);
    }

    @DeleteMapping("/api/admin/gallery/{id}")
    public void deleteGallery(
            @PathVariable Long id) {

        galleryService.deleteGallery(id);
    }
}