import express from "express";
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } 
from "../controllers/courseController.js";
import { createCourseValidation } from "../validation/courseValidation.js";
import { validate } from "../middleware/courseMiddleware.js";

const router = express.Router();

router.post("/", createCourseValidation, validate, createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;