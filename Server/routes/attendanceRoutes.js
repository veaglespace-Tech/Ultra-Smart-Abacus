import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validate from "../middleware/validation.middleware.js";

import {
    attendanceValidation
} from "../validation/attendanceValidation.js";

import {
    markAttendance,
    getAttendanceByStudent,
    getAllAttendance,
    updateAttendance,
    deleteAttendance
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post(
    "/mark",
    authMiddleware,
    authorizeRoles(
        "ADMIN",
        "TEACHER",
        "FRANCHISE",
        "STUDENT"
    ),
    attendanceValidation,
    validate,
    markAttendance
);

router.get(
    "/student/:studentId",
    authMiddleware,
    authorizeRoles(
        "ADMIN",
        "TEACHER",
        "FRANCHISE",
        "STUDENT"
    ),
    getAttendanceByStudent
);

router.get(
    "/",
    authMiddleware,
    authorizeRoles("ADMIN", "TEACHER", "FRANCHISE", "STUDENT"),
    getAllAttendance
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "ADMIN",
        "TEACHER",
        "FRANCHISE",
        "STUDENT"
    ),
    updateAttendance
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("ADMIN"),
    deleteAttendance
);

export default router;