// import prisma from "../config/prisma.js"

// import bcrypt from "bcrypt"

// import generateToken from "../utils/generateToken.js"
// import sendEmail from "../utils/sendEmail.js"

// export const registerUser = async (req, res) => {

//     try {

//         const { name, email, password, role } = req.body

//         const existingUser = await prisma.user.findUnique({
//             where: {
//                 email
//             }
//         })

//         if (existingUser) {
//             return res.status(400).json({
//                 message: "User already exists"
//             })
//         }

//         const hashedPassword = await bcrypt.hash(password, 10)

//         const user = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 role
//             }
//         })

//         const token = generateToken(user)

//         const { password: userPassword, ...safeUser } = user

//     res.status(200).json({
//     message: "Register successful",
//     token,
//     user: safeUser
// })

//     } catch (error) {

//         res.status(500).json({
//             message: error.message
//         })
//     }
// }

// export const loginUser = async (req, res) => {

//     try {

//         const { email, password } = req.body

//         // Check user exists or not
//         const user = await prisma.user.findUnique({
//             where: {
//                 email
//             }
//         })

//         // If user not found
//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }

//         // Compare password
//         const isPasswordMatch = await bcrypt.compare(
//             password,
//             user.password
//         )

//         // Invalid password
//         if (!isPasswordMatch) {
//             return res.status(401).json({
//                 message: "Invalid credentials"
//             })
//         }

//         // Generate JWT token
//         const token = generateToken(user)

//         // Success response
//        const { password: userPassword, ...safeUser } = user

// res.status(200).json({
//     message: "Login successful",
//     token,
//     user: safeUser
// })

//     } catch (error) {

//         res.status(500).json({
//             message: error.message
//         })
//     }
// }

// export const forgotPassword = async (req, res) => {

//     try {

//         const { email } = req.body

//         // Find user
//         const user = await prisma.user.findUnique({
//             where: {
//                 email
//             }
//         })

//         // User not found
//         if (!user) {

//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }

//         // Generate 6 digit OTP
//         const otp = Math.floor(
//             100000 + Math.random() * 900000
//         ).toString()

//         // OTP expiry time (5 minutes)
//         const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

//         // Save OTP in database
//         await prisma.user.update({

//             where: {
//                 email
//             },

//             data: {
//                 otp,
//                 otpExpiry
//             }
//         })

//         // Send email
//         await sendEmail(
//             email,
//             "CRM Password Reset OTP",
//             `Your OTP is ${otp}`
//         )

//         res.status(200).json({
//             message: "OTP sent successfully"
//         })

//     } catch (error) {

//         res.status(500).json({
//             message: error.message
//         })
//     }
// }

// export const resetPassword = async (req, res) => {

//     try {

//         const {
//             email,
//             otp,
//             newPassword
//         } = req.body

//         // Find user
//         const user = await prisma.user.findUnique({
//             where: {
//                 email
//             }
//         })

//         // User not found
//         if (!user) {

//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }

//         // OTP check
//         if (user.otp !== otp) {

//             return res.status(400).json({
//                 message: "Invalid OTP"
//             })
//         }

//         // OTP expiry check
//         if (new Date() > user.otpExpiry) {

//             return res.status(400).json({
//                 message: "OTP expired"
//             })
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(
//             newPassword,
//             10
//         )

//         // Update password
//         await prisma.user.update({

//             where: {
//                 email
//             },

//             data: {

//                 password: hashedPassword,

//                 otp: null,

//                 otpExpiry: null
//             }
//         })

//         res.status(200).json({
//             message: "Password reset successful"
//         })

//     } catch (error) {

//         res.status(500).json({
//             message: error.message
//         })
//     }
// }

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
                "Password reset successful"
        })
    })