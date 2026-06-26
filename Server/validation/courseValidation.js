import {body} from "express-validator";

export const createCourseValidation = [
    body("name").notEmpty().withMessage("name field should not be empty"),
    body("code").notEmpty().withMessage("code field should not be empty"),
    body("description").notEmpty().withMessage("description field should not be empty"),
    body("duration").notEmpty() .optional()
    .isInt({ min: 1 }).withMessage("Duration must be a positive integer"),
    body("fees").notEmpty().optional().isInt({ min: 1}).withMessage("fees must be a positive number")
];














   