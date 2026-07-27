import { body } from "express-validator";

export const createExamValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Exam title is required"),

  body("curriculumTrack")
    .trim()
    .notEmpty()
    .withMessage("Curriculum Track is required"),

  body("batchId")
    .isInt({ min: 1 })
    .withMessage("Valid Batch ID is required"),

  body("examDate")
    .isISO8601()
    .withMessage("Valid Exam Date is required"),

  body("examType")
    .isIn(["WEEKLY", "MONTHLY", "LEVEL", "FINAL"])
    .withMessage("Invalid Exam Type"),

  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be greater than 0"),

  body("totalMarks")
    .isInt({ min: 1 })
    .withMessage("Total Marks must be greater than 0"),

  body("passingMarks")
    .isInt({ min: 0 })
    .withMessage("Passing Marks must be greater than or equal to 0")
    .custom((value, { req }) => {
      if (value > req.body.totalMarks) {
        throw new Error("Passing marks cannot exceed total marks");
      }
      return true;
    }),

  body("teacherId")
    .isInt({ min: 1 })
    .withMessage("Valid Teacher ID is required"),
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