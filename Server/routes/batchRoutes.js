import express from "express"
import { createBatch,getAllBatches, getBatchById, updateBatch, deleteBatch,getBatchesByCourseId } 
from "../controllers/batchController.js"
import { createBatchValidation } from "../validation/batchValidation.js"
import { validate } from "../middleware/batchMiddleware.js"
import authMiddleware from "../middleware/authMiddleware.js"
import authorize from "../middleware/roleMiddleware.js"




const router = express.Router()

router.post("/", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), createBatchValidation, validate,  createBatch)   
router.get("/", authMiddleware, getAllBatches)
router.get("/:id", getBatchById)
router.put("/:id", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), updateBatch)
router.delete("/:id", authMiddleware, authorize("ADMIN", "FRANCHISE", "TEACHER"), deleteBatch)
router.get("/course/:courseId", getBatchesByCourseId)

export default router