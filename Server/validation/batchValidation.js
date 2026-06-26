import { body } from "express-validator";

export const createBatchValidation = [
    body("name").notEmpty().withMessage("name field should not be empty"),
    body("code").notEmpty().withMessage("code field should not be empty"),
    body("description").notEmpty().withMessage("description field should not be empty"),
    body("level").notEmpty().withMessage("level field should not be empty"),
    body("startDate").notEmpty().withMessage("startDate field should not be empty"),
    body("endDate").notEmpty().withMessage("endDate field should not be empty"),
    body("maxStudents").notEmpty().withMessage("maxStudents field should not be empty"),
]









