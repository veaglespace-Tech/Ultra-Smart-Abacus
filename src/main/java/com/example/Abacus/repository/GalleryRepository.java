package com.example.Abacus.repository;

import com.example.Abacus.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryRepository extends JpaRepository<Gallery, Long> {

    List<Gallery> findByActiveTrue();

}