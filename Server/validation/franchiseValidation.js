import { body } from "express-validator";

const franchiseValidation = [
    body("name")
        .notEmpty()
        .withMessage("Franchise name is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .isLength({min:6})
        .withMessage("Password minimum 6 chars"),

    body("phone")
        .notEmpty()
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone number must be 10 digits"),

    body("address")
        .notEmpty()
        .withMessage("Address is required")
];

export default franchiseValidation;