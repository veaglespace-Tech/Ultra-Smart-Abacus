import express from "express";
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } 
from "../controllers/courseController.js";
import { createCourseValidation } from "../validation/courseValidation.js";
import { validate } from "../middleware/courseMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("FRANCHISE","TEACHER"), createCourseValidation, validate, createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", authMiddleware, authorize("FRANCHISE","TEACHER"), updateCourse);
router.delete("/:id", authMiddleware, authorize("FRANCHISE","TEACHER"), deleteCourse);

export default router;