import { body } from "express-validator";

export const createExamValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Exam title is required"),

  body("curriculumTrack")
    .optional()
    .trim(),

  body("batchId")
    .optional(),

  body("examDate")
    .optional(),

  body("examType")
    .optional(),

  body("duration")
    .optional(),

  body("totalMarks")
    .optional(),

  body("passingMarks")
    .optional(),

  body("teacherId")
    .optional(),
];

export const updateExamValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Exam title cannot be empty"),

  body("curriculumTrack")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Curriculum Track cannot be empty"),

  body("batchId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid Batch ID is required"),

  body("examDate")
    .optional()
    .isISO8601()
    .withMessage("Valid Exam Date is required"),

  body("examType")
    .optional()
    .isIn(["WEEKLY", "MONTHLY", "LEVEL", "FINAL"])
    .withMessage("Invalid Exam Type"),

  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be greater than 0"),

  body("totalMarks")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total Marks must be greater than 0"),

  body("passingMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Passing Marks must be valid"),

  body("status")
    .optional()
    .isIn([
      "DRAFT",
      "SCHEDULED",
      "COMPLETED",
      "RESULT_PENDING",
      "PUBLISHED",
      "CANCELLED",
    ])
    .withMessage("Invalid Exam Status"),
];