import express from "express";
import {
    createBatchRequest,
    getTeacherBatchRequests,
    getFranchiseBatchRequests,
    approveBatchRequest,
    rejectBatchRequest
} from "../controllers/batchRequestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("TEACHER", "ADMIN"), createBatchRequest);
router.get("/teacher", authMiddleware, authorize("TEACHER", "ADMIN"), getTeacherBatchRequests);
router.get("/franchise", authMiddleware, authorize("FRANCHISE", "ADMIN"), getFranchiseBatchRequests);
router.patch("/:id/approve", authMiddleware, authorize("FRANCHISE", "ADMIN"), approveBatchRequest);
router.put("/:id/approve", authMiddleware, authorize("FRANCHISE", "ADMIN"), approveBatchRequest);
router.patch("/:id/reject", authMiddleware, authorize("FRANCHISE", "ADMIN"), rejectBatchRequest);
router.put("/:id/reject", authMiddleware, authorize("FRANCHISE", "ADMIN"), rejectBatchRequest);

export default router;
