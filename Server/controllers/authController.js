
import prisma from "../config/prisma.js"
import bcrypt from "bcrypt"

import generateToken from "../utils/generateToken.js"
import sendEmail from "../utils/sendEmail.js"

import asyncHandler from "../utils/asyncHandler.js"
import CustomError from "../utils/customError.js"

export const registerUser = asyncHandler(
    async (req, res) => {

        const {
            name,
            email,
            password,
            role
        } = req.body

        const existingUser =
            await prisma.user.findUnique({
                where: { email }
            })

        if (existingUser) {

            throw new CustomError(
                "User already exists",
                400
            )
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            )

        const user =
            await prisma.user.create({

                data: {
                    name,
                    email,
                    password:
                        hashedPassword,
                    role
                }
            })

        const token =
            generateToken(user)

        const {
            password: userPassword,
            ...safeUser
        } = user

        res.status(201).json({

            message:
                "Register successful",

            token,

            user: safeUser
        })
    }
)

export const loginUser =
    asyncHandler(async (
        req,
        res
    ) => {

        const {
            email,
            password
        } = req.body

        const user =
            await prisma.user.findUnique({
                where: { email }
            })

        if (!user) {

            throw new CustomError(
                "User not found",
                404
            )
        }

        const isPasswordMatch =
            await bcrypt.compare(
                password,
                user.password
            )

        if (!isPasswordMatch) {

            throw new CustomError(
                "Invalid credentials",
                401
            )
        }

        const token =
            generateToken(user)

        const {
            password: userPassword,
            ...safeUser
        } = user

        res.status(200).json({

            message:
                "Login successful",

            token,

            user: safeUser
        })
    })


    export const forgotPassword =
    asyncHandler(async (
        req,
        res
    ) => {

        const { email } =
            req.body

        const user =
            await prisma.user.findUnique({
                where: { email }
            })

        if (!user) {

            throw new CustomError(
                "User not found",
                404
            )
        }

        const otp = Math.floor(
            100000 +
            Math.random() *
            900000
        ).toString()

        const otpExpiry =
            new Date(
                Date.now() +
                5 * 60 * 1000
            )

        await prisma.user.update({

            where: { email },

            data: {
                otp,
                otpExpiry
            }
        })

        await sendEmail(
            email,
            "CRM Password Reset OTP",
            `Your OTP is ${otp}`
        )

        res.status(200).json({

            message:
                "OTP sent successfully"
        })
    })


    export const resetPassword =
    asyncHandler(async (
        req,
        res
    ) => {

        const {
            email,
            otp,
            newPassword
        } = req.body

        const user =
            await prisma.user.findUnique({
                where: { email }
            })

        if (!user) {

            throw new CustomError(
                "User not found",
                404
            )
        }

        if (user.otp !== otp) {

            throw new CustomError(
                "Invalid OTP",
                400
            )
        }

        if (
            new Date() >
            user.otpExpiry
        ) {

            throw new CustomError(
                "OTP expired",
                400
            )
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            )

        await prisma.user.update({

            where: { email },

            data: {

                password:
                    hashedPassword,

                otp: null,

                otpExpiry: null
            }
        })

        res.status(200).json({

            message:
                "Password reset successfull"
        })
    })