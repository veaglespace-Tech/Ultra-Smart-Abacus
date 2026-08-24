import express from "express";

import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  submitMarks,
  publishResults,
  getStudentExams,
} from "../controllers/examController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

import {
  createExamValidation,
  updateExamValidation,
} from "../validation/examValidation.js";

import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

/**
 * CREATE EXAM
 * Access: Admin, Teacher & Franchise
 */
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "FRANCHISE"),
  createExam
);

/**
 * GET STUDENT EXAMS
 * Access: Student
 */
router.get(
  "/student/me",
  authMiddleware,
  authorize("STUDENT"),
  getStudentExams
);

/**
 * GET ALL EXAMS
 * Access: Admin, Teacher, Student & Franchise
 */
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "STUDENT", "FRANCHISE"),
  getAllExams
);

/**
 * GET EXAM BY ID
 * Access: Admin, Teacher, Student & Franchise
 */
router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "STUDENT", "FRANCHISE"),
  getExamById
);

/**
 * SUBMIT MARKS FOR EXAM
 * Access: Admin, Teacher & Franchise
 */
router.post(
  "/:id/marks",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "FRANCHISE"),
  submitMarks
);

/**
 * PUBLISH EXAM RESULTS
 * Access: Admin, Teacher & Franchise
 */
router.patch(
  "/:id/publish",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "FRANCHISE"),
  publishResults
);

/**
 * UPDATE EXAM
 * Access: Admin, Teacher & Franchise
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "FRANCHISE"),
  updateExamValidation,
  validationMiddleware,
  updateExam
);

/**
 * DELETE EXAM
 * Access: Admin, Teacher & Franchise
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "FRANCHISE"),
  deleteExam
);

export default router;
