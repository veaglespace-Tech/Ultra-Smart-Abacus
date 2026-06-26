import { body } from "express-validator";

export const createNotificationValidation = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("type")
        .notEmpty()
        .withMessage("Notification type is required")
        .isIn([
            "GENERAL",
            "EXAM",
            "FEE",
            "ATTENDANCE",
            "ANNOUNCEMENT"
        ])
        .withMessage("Invalid notification type"),

    body("recipientType")
        .isIn([
               "ALL",
            "STUDENTS",
            "TEACHERS",
            "FRANCHISES",
            "BATCH",
            "STUDENT"])
            .withMessage("Invalid recipient type"),


    body("batchId").optional()  .isInt().notEmpty()
    .withMessage("Batch ID is required for BATCH notifications"),

    body("studentId").optional().isInt().notEmpty()
    .withMessage("Student ID is required for STUDENT notifications")
];