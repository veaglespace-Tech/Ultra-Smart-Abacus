import express from "express";
import {createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyProfile} from "../controllers/studentController.js";
import { createStudentValidation, updateStudentValidation } from "../validation/studentValidation.js";
import { validate } from "../middleware/studentMiddleware.js";
import  authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";



const router = express.Router();


router.post("/",authMiddleware,
authorize("FRANCHISE","TEACHER"),
upload.single("profilePhoto"),
createStudentValidation,
validate,
createStudent);

router.get("/",getAllStudents);
router.get("/profile/me", authMiddleware, getMyProfile);
router.get("/:id",getStudentById);

router.put("/:id", upload.single("profilePhoto"),
 updateStudentValidation, 
 validate,
  updateStudent);
  
router.delete("/:id",deleteStudent);

export default router;
