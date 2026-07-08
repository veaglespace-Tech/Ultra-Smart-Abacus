
import { body } from "express-validator";

export const registerValidation = [

    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage(
            "Full name must be at least 3 characters"
        ),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage(
            "Invalid email format"
        ),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage(
            "Password must be at least 6 characters"
        ),

    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .bail()
        .isIn([
            "ADMIN",
            "FRANCHISE",
            "TEACHER",
            "STUDENT",
        ])
        .withMessage(
            "Invalid role"
        ),
];

export const loginValidation = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage(
            "Invalid email format"
        ),

    body("password")
        .trim()
        .notEmpty()
        .withMessage(
            "Password is required"
        ),
];