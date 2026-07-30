import express from "express";

import { createReferral } from "../controllers/referralController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import roleMiddleware from "../middleware/roleMiddleware.js";

import { createReferralValidation }  from "../validation/referralValidation.js";

const router = express.Router();



router.post(
  "/create",
  authMiddleware,
  roleMiddleware("FRANCHISE", "STUDENT", "TEACHER", "ADMIN"),
  createReferralValidation,
  createReferral
);

export default router;