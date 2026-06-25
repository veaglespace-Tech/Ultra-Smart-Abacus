import { body } from "express-validator";

export const createStudentValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("rollNo").notEmpty().withMessage("Roll number is required"),
];