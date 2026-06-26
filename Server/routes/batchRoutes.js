import express from "express"
import { createBatch,getAllBatches, getBatchById, updateBatch, deleteBatch } 
from "../controllers/batchController.js"
import { createBatchValidation } from "../validation/batchValidation.js"
import { validate } from "../middleware/batchMiddleware.js"




const router = express.Router()

router.post("/", createBatchValidation, validate,  createBatch)   
router.get("/", getAllBatches)
router.get("/:id", getBatchById)
router.put("/:id", updateBatch)
router.delete("/:id", deleteBatch)

export default router