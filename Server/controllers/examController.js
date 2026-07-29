import prisma from "../config/prisma.js";
import { examService } from "../services/examService.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create Exam
 */
export const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

/**
 * Get All Exams
 */
export const getAllExams = asyncHandler(async (req, res) => {
  const query = { ...req.query };

  const result = await examService.getAllExams(query);

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
 * Submit Marks for Exam
 */
export const submitMarks = asyncHandler(async (req, res) => {
  const studentMarksMap = req.body.studentMarks || req.body;
  const exam = await examService.submitMarks(req.params.id, studentMarksMap);

  res.status(200).json({
    success: true,
    message: "Exam marks saved successfully",
    data: exam,
  });
});

/**
 * Publish Exam Results
 */
export const publishResults = asyncHandler(async (req, res) => {
  const exam = await examService.publishResults(req.params.id);

  res.status(200).json({
    success: true,
    message: "Exam results published successfully",
    data: exam,
  });
});

/**
 * Get Student Exams & Results
 */
export const getStudentExams = asyncHandler(async (req, res) => {
  const exams = await examService.getStudentExams(req.user.id);

  res.status(200).json({
    success: true,
    data: exams,
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