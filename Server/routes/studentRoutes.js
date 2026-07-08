import express from "express";
import {createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyProfile} from "../controllers/studentController.js";
import { createStudentValidation } from "../validation/studentValidation.js";
import { validate } from "../middleware/studentMiddleware.js";
import  authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";



const router = express.Router();


router.post("/",authMiddleware,
authorize("FRANCHISE","TEACHER"),
createStudentValidation,validate,createStudent);
router.get("/",getAllStudents);
router.get("/profile/me", authMiddleware, getMyProfile);
router.get("/:id",getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id",deleteStudent);

export default router;
