import express from "express";
import {createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent} from "../controllers/studentController.js";
import { createStudentValidation } from "../validation/studentValidation.js";
import { validate } from "../middleware/studentMiddleware.js";
import  authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";


const router = express.Router();
router.post("/",authMiddleware,
authorize("FRANCHISE","TEACHER"),
createStudentValidation,validate,createStudent);

router.get("/",getAllStudents);
router.get("/:id",getStudentById);
router.put("/:id",createStudentValidation,validate, updateStudent);
router.delete("/:id",deleteStudent);

export default router;
