
import prisma from "../config/prisma.js"
import bcrypt from "bcrypt"

import generateToken from "../utils/generateToken.js"
import sendEmail from "../utils/sendEmail.js"

import asyncHandler from "../utils/asyncHandler.js"
import CustomError from "../utils/customError.js"
import welcomeEmail from "../template/welcomeEmail.js";
import otpEmail from "../template/otpEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        password,
        role,
        parentGuardianName,
        phone,
        gender,
        city,
        address,
        dateOfBirth,
    } = req.body;

    const profilePhoto = req.file
        ? `/uploads/students/${req.file.filename}`
        : req.body.profilePhoto || null;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new CustomError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: fullName,
            email,
            password: hashedPassword,
            role,
            gender,
            phone,
            city,
            address,
            parentGuardianName,
        },
    });

    await sendEmail(
        email,
        "Welcome to Ultra Smart Abacus",
        welcomeEmail(fullName)
    );

    if (role === "STUDENT") {
        await prisma.student.create({
            data: {
                name: fullName,
                email,
                password: hashedPassword,
                phone: phone || null,
                gender: gender || null,
                address: address || null,
                fatherName: parentGuardianName || null,
                dateOfBirth: dateOfBirth
                    ? new Date(dateOfBirth)
                    : null,
                profilePhoto,
                userId: user.id,
            },
        });
    } else if (role === "TEACHER") {
        await prisma.teacher.create({
            data: {
                name: fullName,
                qualification: "Abacus Certified Instructor",
                experience: 2,
                phone: phone || null,
                userId: user.id,
            },
        });
    } else if (role === "FRANCHISE") {
        await prisma.franchise.create({
            data: {
                name: fullName,
                email,
                phone: phone || null,
                address: address || null,
                userId: user.id,
            },
        });
    }

    const token = generateToken(user);
    const { password: userPassword, ...safeUser } = user;

    res.status(201).json({
        message: "Register successful",
        token,
        user: safeUser,
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            student: true,
            teacher: true,
            franchise: true,
        },
    });

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatch) {
        throw new CustomError("Invalid credentials", 401);
    }

    const token = generateToken(user);
    const { password: userPassword, ...safeUser } = user;
    if (safeUser.student && safeUser.student.profilePhoto) {
        safeUser.profilePhoto = safeUser.student.profilePhoto;
    } else if (safeUser.teacher && safeUser.teacher.profilePhoto) {
        safeUser.profilePhoto = safeUser.teacher.profilePhoto;
    }

    res.status(200).json({
        message: "Login successful",
        token,
        user: safeUser,
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
        where: { email },
        data: {
            otp,
            otpExpiry,
        },
    });

    await sendEmail(
        email,
        "Abacus Password Reset OTP",
        `Your OTP is ${otp}`
    );

    res.status(200).json({
        message: "OTP sent successfully",
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    if (user.otp !== otp) {
        throw new CustomError("Invalid OTP", 400);
    }

    if (new Date() > user.otpExpiry) {
        throw new CustomError("OTP expired", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            otp: null,
            otpExpiry: null,
        },
    });

    res.status(200).json({
        message: "Password reset successful",
    });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, email } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
        throw new CustomError("Current password and new password are required", 400);
    }

    let user;
    if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
        user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new CustomError("Current password does not match", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
        },
    });

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});