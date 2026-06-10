package com.example.Abacus.service;

import com.example.Abacus.dto.request.GalleryRequest;
import com.example.Abacus.dto.response.GalleryResponse;
import com.example.Abacus.entity.Gallery;
import com.example.Abacus.repository.GalleryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryRepository galleryRepository;

    public GalleryResponse createGallery(GalleryRequest request) {

        Gallery gallery = Gallery.builder()
                .title(request.title())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .active(request.active() != null ? request.active() : true)
                .build();

        gallery = galleryRepository.save(gallery);

        return mapToResponse(gallery);
    }

    public List<GalleryResponse> getAllGallery() {
        return galleryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<GalleryResponse> getActiveGallery() {
        return galleryRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public GalleryResponse getGalleryById(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery not found"));

        return mapToResponse(gallery);
    }

    public GalleryResponse updateGallery(Long id, GalleryRequest request) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery not found"));

        gallery.setTitle(request.title());
        gallery.setDescription(request.description());
        gallery.setImageUrl(request.imageUrl());

        if (request.active() != null) {
            gallery.setActive(request.active());
        }

        gallery = galleryRepository.save(gallery);

        return mapToResponse(gallery);
    }

    public void deleteGallery(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery not found"));

        galleryRepository.delete(gallery);
    }

    private GalleryResponse mapToResponse(Gallery gallery) {
        return new GalleryResponse(
                gallery.getId(),
                gallery.getTitle(),
                gallery.getDescription(),
                gallery.getImageUrl(),
                gallery.getActive(),
                gallery.getCreatedAt()
        );
    }
}