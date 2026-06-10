package com.example.Abacus.service;

import com.example.Abacus.dto.request.CourseRequest;
import com.example.Abacus.dto.response.CourseResponse;
import com.example.Abacus.entity.Course;
import com.example.Abacus.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    // Create Course
    public CourseResponse createCourse(CourseRequest request) {

        Course course = new Course();

        course.setName(request.name());
        course.setDescription(request.description());
        course.setDurationInMonths(request.durationInMonths());
        course.setFees(request.fees());
        course.setActive(request.active());

        Course savedCourse = courseRepository.save(course);

        return mapToResponse(savedCourse);
    }

    // Get All Courses
    public List<CourseResponse> getAllCourses() {

        return courseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get Course By Id
    public CourseResponse getCourseById(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return mapToResponse(course);
    }

    // Update Course
    public CourseResponse updateCourse(Long id, CourseRequest request) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setName(request.name());
        course.setDescription(request.description());
        course.setDurationInMonths(request.durationInMonths());
        course.setFees(request.fees());
        course.setActive(request.active());

        Course updatedCourse = courseRepository.save(course);

        return mapToResponse(updatedCourse);
    }

    // Delete Course
    public void deleteCourse(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        courseRepository.delete(course);
    }

    // Mapper
    private CourseResponse mapToResponse(Course course) {

        return new CourseResponse(
                course.getId(),
                course.getName(),
                course.getDescription(),
                course.getDurationInMonths(),
                course.getFees(),
                course.getActive(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }
}