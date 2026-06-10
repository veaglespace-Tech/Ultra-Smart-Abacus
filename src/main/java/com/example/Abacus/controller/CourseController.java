package com.example.Abacus.controller;

import com.example.Abacus.dto.request.CourseRequest;
import com.example.Abacus.dto.response.CourseResponse;
import com.example.Abacus.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // Create
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(request));
    }

    // Get All
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {

        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Get By Id
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {

        return ResponseEntity.ok(
                courseService.updateCourse(id, request)
        );
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCourse(
            @PathVariable Long id) {

        courseService.deleteCourse(id);

        return ResponseEntity.ok("Course deleted successfully");
    }


}