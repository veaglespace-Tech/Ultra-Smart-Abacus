
import { body } from "express-validator";

export const registerValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .bail()
        .isLength({ min: 2 })
        .withMessage(
            "Name must be at least 2 characters"
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
            "SUPER_ADMIN",
            "ADMIN",
            "TEAM_LEADER",
            "EMPLOYEE",
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