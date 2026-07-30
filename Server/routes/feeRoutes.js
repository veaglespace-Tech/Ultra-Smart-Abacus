import express from "express";
import {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
  getMyFees,
  getFeeReceipt,
  recordPayment,
  getStudentFeesSummary,
  createDemoFee
} from "../controllers/feeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { createFeeValidation, recordPaymentValidation } from "../validation/feeValidation.js";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

// CREATE FEE (Admin & Franchise only)
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  createFeeValidation,
  validationMiddleware,
  createFee
);

// GET ALL FEES WITH FILTERS (Admin & Franchise only)
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  getFees
);

// STUDENT: Get own fees
router.get(
  "/me",
  authMiddleware,
  authorize("STUDENT", "ADMIN", "FRANCHISE", "TEACHER"),
  getMyFees
);

// STUDENT: Create demo fee (Testing receipt download)
router.post(
  "/me/demo",
  authMiddleware,
  authorize("STUDENT"),
  createDemoFee
);

// GET FEE BY ID (Admin, Franchise & Student)
router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE", "STUDENT"),
  getFeeById
);


// UPDATE FEE DETAILS (Admin & Franchise only)
router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  updateFee
);

// RECORD FEE PAYMENT (Admin & Franchise only)
router.post(
  "/:id/payment",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  recordPaymentValidation,
  validationMiddleware,
  recordPayment
);

// GET FEE RECEIPT (Admin, Franchise & Student)
router.get(
  "/:id/receipt",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE", "STUDENT"),
  getFeeReceipt
);

// GET STUDENT FEES SUMMARY & HISTORY (Admin, Franchise & Student)
router.get(
  "/student/:studentId",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE", "STUDENT"),
  getStudentFeesSummary
);

// DELETE FEE (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteFee
);

export default router;