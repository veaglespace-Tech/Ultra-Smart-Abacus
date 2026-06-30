import { body } from "express-validator";

export const attendanceValidation = [

    body("studentId")
        .notEmpty()
        .withMessage("Student Id is required")
        .isInt()
        .withMessage("Student Id must be a number"),

    body("teacherId")
        .notEmpty()
        .withMessage("Teacher Id is required")
        .isInt()
        .withMessage("Teacher Id must be a number"),

    body("batchId")
        .notEmpty()
        .withMessage("Batch Id is required")
        .isInt()
        .withMessage("Batch Id must be a number"),

    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn([
            "PRESENT",
            "ABSENT",
            "LEAVE"
        ])
        .withMessage("Invalid Attendance Status"),

    body("remarks")
        .optional()
        .isString()
        .withMessage("Remarks must be a string")
];