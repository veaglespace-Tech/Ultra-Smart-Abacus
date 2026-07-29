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
 * Access: Admin & Teacher
 */
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
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
 * Access: Admin, Teacher & Student
 */
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "STUDENT"),
  getAllExams
);

/**
 * GET EXAM BY ID
 * Access: Admin, Teacher & Student
 */
router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER", "STUDENT"),
  getExamById
);

/**
 * SUBMIT MARKS FOR EXAM
 * Access: Admin & Teacher
 */
router.post(
  "/:id/marks",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  submitMarks
);

/**
 * PUBLISH EXAM RESULTS
 * Access: Admin & Teacher
 */
router.patch(
  "/:id/publish",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  publishResults
);

/**
 * UPDATE EXAM
 * Access: Admin & Teacher
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  updateExamValidation,
  validationMiddleware,
  updateExam
);

/**
 * DELETE EXAM
 * Access: Admin & Teacher
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  deleteExam
);

export default router;