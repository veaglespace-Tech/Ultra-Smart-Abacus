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
  body("batchId").optional({ checkFalsy: true }).isInt().withMessage("Batch ID must be integer")
 
];

export const updateStudentValidation = [
  body("name").optional({ checkFalsy: true }).notEmpty().withMessage("Name is required"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Valid email is required"),
  body("password").optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("dateOfBirth").optional({ checkFalsy: true }).isDate().withMessage("Valid date of birth is required"),
  body("gender").optional({ checkFalsy: true }).isIn(["male", "female", "other"]).withMessage("Gender must be male, female or other"),
  body("phone").optional({ checkFalsy: true }).isMobilePhone().withMessage("Valid phone number is required"),  
  body("address").optional({ checkFalsy: true }).notEmpty().withMessage("Address is required"),
  body("fatherName").optional({ checkFalsy: true }).notEmpty().withMessage("Father's name is required"),
  body("batchId").optional({ checkFalsy: true }).isInt().withMessage("Batch ID must be integer")
];