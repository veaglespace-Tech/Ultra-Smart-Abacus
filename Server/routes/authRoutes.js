import express from "express"

import {

    registerUser,

    loginUser,

    forgotPassword,

    resetPassword

} from "../controllers/authController.js"

import validate from "../middleware/validation.middleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    registerValidation,
    loginValidation,
} from "../validation/auth.validation.js";

const router = express.Router()

router.post(
    "/register",
    upload.single("profilePhoto"),
    registerValidation,
    validate,
    registerUser
);

router.post(
    "/login",
    loginValidation,
    validate,
    loginUser
);

router.post("/forgot-password", forgotPassword)

router.post("/reset-password", resetPassword)

export default router