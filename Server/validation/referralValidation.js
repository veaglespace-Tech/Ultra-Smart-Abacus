import { body } from "express-validator";

export const createReferralValidation = [
  body("role")
    .notEmpty()
    .isIn(["STUDENT", "TEACHER"])
    .withMessage("Role must be STUDENT or TEACHER"),
];