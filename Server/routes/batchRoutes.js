import express from "express";
import { 
    createBatch, 
    getAllBatches, 
    getBatchById, 
    updateBatch, 
    deleteBatch, 
    getBatchesByCourseId 
} from "../controllers/batchController.js";
import { 
    createBatchRequest, 
    getTeacherBatchRequests, 
    getFranchiseBatchRequests, 
    approveBatchRequest, 
    rejectBatchRequest 
} from "../controllers/batchRequestController.js";
import { createBatchValidation } from "../validation/batchValidation.js";
import { validate } from "../middleware/batchMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Batch Request Routes (must be placed BEFORE /:id to avoid route collision)
router.post("/requests", authMiddleware, authorize("TEACHER", "ADMIN"), createBatchRequest);
router.get("/requests/teacher", authMiddleware, authorize("TEACHER", "ADMIN"), getTeacherBatchRequests);
router.get("/requests/franchise", authMiddleware, authorize("FRANCHISE", "ADMIN"), getFranchiseBatchRequests);
router.patch("/requests/:id/approve", authMiddleware, authorize("FRANCHISE", "ADMIN"), approveBatchRequest);
router.put("/requests/:id/approve", authMiddleware, authorize("FRANCHISE", "ADMIN"), approveBatchRequest);
router.patch("/requests/:id/reject", authMiddleware, authorize("FRANCHISE", "ADMIN"), rejectBatchRequest);
router.put("/requests/:id/reject", authMiddleware, authorize("FRANCHISE", "ADMIN"), rejectBatchRequest);

// Standard Batch Routes
router.post("/", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), createBatchValidation, validate, createBatch);
router.get("/", authMiddleware, getAllBatches);
router.get("/course/:courseId", getBatchesByCourseId);
router.get("/:id", getBatchById);
router.put("/:id", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), updateBatch);
router.delete("/:id", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), deleteBatch);

export default router;