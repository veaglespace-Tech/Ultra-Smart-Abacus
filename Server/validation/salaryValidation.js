import { body } from "express-validator"

const salaryValidation = [
    body("teacherId")
        .notEmpty()
        .withMessage("Teacher ID is required")
        .isInt()
        .withMessage("Teacher ID must be an integer"),

    body("month")
        .notEmpty()
        .withMessage("Month is required")
        .isInt({ min: 1, max: 12 })
        .withMessage("Month must be between 1 and 12"),

    body("year")
        .notEmpty()
        .withMessage("Year is required")
        .isInt({ min: 2000, max: 2100 })
        .withMessage("Year must be a valid 4-digit year"),

    body("bonus")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Bonus must be a positive number"),

    body("deductions")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Deductions must be a positive number"),

    body("paymentStatus")
        .optional()
        .isIn(["PAID", "PENDING"])
        .withMessage("Status must be PAID or PENDING"),

    body("paymentMode")
        .optional()
        .isIn(["Bank Transfer", "UPI", "Cash", "Cheque", "Other"])
        .withMessage("Invalid payment mode"),

    body("referenceNumber")
        .optional()
        .trim(),

    body("remarks")
        .optional()
        .trim()
];

export default salaryValidation;
