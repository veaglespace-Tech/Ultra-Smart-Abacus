package com.example.Abacus.controller;

import com.example.Abacus.dto.request.BlogRequest;
import com.example.Abacus.dto.response.BlogResponse;
import com.example.Abacus.service.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // Create Blog
    @PostMapping()
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody BlogRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(blogService.createBlog(request));

    }

    // Get All Blogs
    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAllBlogs() {

        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    // Get Blog By Id
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    // Update Blog
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogRequest request) {

        return ResponseEntity.ok(
                blogService.updateBlog(id, request)
        );
    }

    // Delete Blog
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBlog(
            @PathVariable Long id) {

        blogService.deleteBlog(id);

        return ResponseEntity.ok("Blog deleted successfully");
    }


}