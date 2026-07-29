import express from "express";
import {createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getStudentNotifications,
    getTeacherNotifications,
    getMyStudentNotifications,
    getFranchiseNotifications} from "../controllers/notificationController.js";
import { createNotificationValidation } from "../validation/notificationValidation.js";
import { validate } from "../middleware/notificationMiddleware.js";
import  authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/",authMiddleware,
authorize("ADMIN","FRANCHISE"),
createNotificationValidation,
validate,
createNotification);

router.get("/", authMiddleware, authorize("ADMIN", "FRANCHISE"), getAllNotifications);

router.get(
    "/teacher",
    authMiddleware,
    authorize("TEACHER", "ADMIN"),
    getTeacherNotifications
);

router.get(
    "/franchise",
    authMiddleware,
    authorize("FRANCHISE", "ADMIN"),
    getFranchiseNotifications
);

router.get(
    "/student/me",
    authMiddleware,
    getMyStudentNotifications
);

router.get(
    "/student/:studentId",
    authMiddleware,
    getStudentNotifications
);

router.get(
    "/:id",
    authMiddleware,
    getNotificationById
);

router.put("/:id",authMiddleware,
authorize("ADMIN","FRANCHISE"),
createNotificationValidation,
validate,
 updateNotification
);

router.delete("/:id",authMiddleware,
authorize("ADMIN","FRANCHISE"),
deleteNotification
);

export default router;

