import { body } from "express-validator";

export const createStudentValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("dateOfBirth").isDate().withMessage("Valid date of birth is required"),
  body("gender").isIn(["male", "female", "other"]). withMessage("Gender must be male, female    or other"),
  body("phone").isMobilePhone().withMessage("Valid phone number is required"),  
  body("address").notEmpty().withMessage("Address is required"),
  body("fatherName").notEmpty().withMessage("Father's name is required"),
  body("batchId").optional().isInt().withMessage("Batch ID must be integer")
 
];