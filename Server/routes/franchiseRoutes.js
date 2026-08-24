import express from "express"

import {
registerFranchise,
getFranchiseProfile,
updateFranchiseProfile,
getFranchises,
updateFranchise,
deleteFranchise,
getFranchiseMetrics
}
from "../controllers/franchiseController.js"

import authMiddleware from "../middleware/authMiddleware.js"
import authorize from "../middleware/roleMiddleware.js"

import franchiseValidation from "../validation/franchiseValidation.js"
import validationMiddleware from "../middleware/validation.middleware.js"


import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()


router.get(
    "/metrics",
    authMiddleware,
    authorize("FRANCHISE"),
    getFranchiseMetrics
)


router.post(
    "/register",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    franchiseValidation,
    validationMiddleware,
    registerFranchise
)


router.get(
    "/profile",
    authMiddleware,
    authorize("FRANCHISE", "ADMIN"),
    getFranchiseProfile
)

router.put(
    "/profile",
    authMiddleware,
    authorize("FRANCHISE", "ADMIN"),
    upload.single("profilePhoto"),
    updateFranchiseProfile
)


router.get(
    "/",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    getFranchises
)


router.put(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    franchiseValidation,
    validationMiddleware,
    updateFranchise
)


router.delete(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "FRANCHISE"),
    deleteFranchise
)


export default router