import { body } from "express-validator";

export const createFeeValidation = [
  body("studentId")
    .isInt({ min: 1 })
    .withMessage("Valid Student ID is required"),
  body("franchiseId")
    .isInt({ min: 1 })
    .withMessage("Valid Franchise ID is required"),
  body("batchId")
    .isInt({ min: 1 })
    .withMessage("Valid Batch ID is required"),
  body("totalFee")
    .isFloat({ min: 0.01 })
    .withMessage("Total fee must be a number greater than 0"),
  body("paidAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Paid amount must be a non-negative number")
    .custom((value, { req }) => {
      if (value > req.body.totalFee) {
        throw new Error("Paid amount cannot exceed total fee");
      }
      return true;
    }),
];

export const recordPaymentValidation = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),
  body("paymentMode")
    .isIn(["Cash", "UPI", "Bank Transfer", "Cheque"])
    .withMessage("Payment mode must be Cash, UPI, Bank Transfer, or Cheque"),
  body("referenceNumber")
    .optional()
    .isString()
    .trim()
    .withMessage("Reference number must be a valid string"),
  body("remarks")
    .optional()
    .isString()
    .trim()
    .withMessage("Remarks must be a valid string"),
];