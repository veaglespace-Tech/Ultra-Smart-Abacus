import express from "express";

import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
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
  createExamValidation,
  validationMiddleware,
  createExam
);

/**
 * GET ALL EXAMS
 * Access: Admin & Teacher
 */
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  getAllExams
);

/**
 * GET EXAM BY ID
 * Access: Admin & Teacher
 */
router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "TEACHER"),
  getExamById
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
 * Access: Admin only
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteExam
);

export default router;