import { examService } from "../services/examService.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create Exam
 */
export const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body);

  res.status(201).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

/**
 * Get All Exams
 */
export const getAllExams = asyncHandler(async (req, res) => {
  const result = await examService.getAllExams(req.query);

  res.status(200).json({
    success: true,
    data: result.exams,
    pagination: result.pagination,
  });
});

/**
 * Get Exam By ID
 */
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.id);

  res.status(200).json({
    success: true,
    data: exam,
  });
});

/**
 * Update Exam
 */
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Exam updated successfully",
    data: exam,
  });
});

/**
 * Delete Exam
 */
export const deleteExam = asyncHandler(async (req, res) => {
  await examService.deleteExam(req.params.id);

  res.status(200).json({
    success: true,
    message: "Exam deleted successfully",
  });
});