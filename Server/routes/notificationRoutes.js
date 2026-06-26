import express from "express";
import {createNotification,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getStudentNotifications} from "../controllers/notificationController.js";
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

