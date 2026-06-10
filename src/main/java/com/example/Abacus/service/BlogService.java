package com.example.Abacus.service;

import com.example.Abacus.dto.request.BlogRequest;
import com.example.Abacus.dto.response.BlogResponse;
import com.example.Abacus.entity.Blog;
import com.example.Abacus.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;

    // Create Blog
    public BlogResponse createBlog(BlogRequest request) {

        Blog blog = new Blog();

        blog.setTitle(request.title());
        blog.setContent(request.content());
        blog.setImageUrl(request.imageUrl());
        blog.setPublished(request.published());

        Blog savedBlog = blogRepository.save(blog);

        return mapToResponse(savedBlog);
    }

    // Get All Blogs
    public List<BlogResponse> getAllBlogs() {

        return blogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get Blog By Id
    public BlogResponse getBlogById(Long id) {

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        return mapToResponse(blog);
    }

    // Update Blog
    public BlogResponse updateBlog(Long id, BlogRequest request) {

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blog.setTitle(request.title());
        blog.setContent(request.content());
        blog.setImageUrl(request.imageUrl());
        blog.setPublished(request.published());

        Blog updatedBlog = blogRepository.save(blog);

        return mapToResponse(updatedBlog);
    }

    // Delete Blog
    public void deleteBlog(Long id) {

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blogRepository.delete(blog);
    }

    private BlogResponse mapToResponse(Blog blog) {

        return new BlogResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getImageUrl(),
                blog.getPublished(),
                blog.getCreatedAt()
        );
    }
}