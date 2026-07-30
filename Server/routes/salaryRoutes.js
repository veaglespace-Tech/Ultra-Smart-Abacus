import express from "express"
import {
    createSalary,
    updateSalary,
    markSalaryAsPaid,
    getSalaryHistory,
    getTeacherSalaryHistory,
    getSalaryDetails
} from "../controllers/salaryController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import authorize from "../middleware/roleMiddleware.js"
import salaryValidation from "../validation/salaryValidation.js"
import validationMiddleware from "../middleware/validation.middleware.js"

const router = express.Router()

// CREATE SALARY (Franchise Admin or System Admin)
router.post(
    "/",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    salaryValidation,
    validationMiddleware,
    createSalary
)

// GET SALARY HISTORY (Franchise Admin, System Admin, or Teacher)
router.get(
    "/history",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE", "TEACHER"),
    getSalaryHistory
)

// GET OWN SALARY HISTORY (Teacher, Admin, or Franchise)
router.get(
    "/my-history",
    authMiddleware,
    authorize("TEACHER", "ADMIN", "FRANCHISE"),
    getTeacherSalaryHistory
)

// GET SALARY DETAILS
router.get(
    "/:id",
    authMiddleware,
    getSalaryDetails
)

// UPDATE SALARY DETAILS (Franchise Admin or System Admin)
router.put(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    updateSalary
)

// MARK SALARY AS PAID (Franchise Admin or System Admin)
router.patch(
    "/:id/pay",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    markSalaryAsPaid
)

export default router
