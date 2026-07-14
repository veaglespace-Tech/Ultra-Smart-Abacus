import prisma from "../config/prisma.js"
import asyncHandler from "../utils/asyncHandler.js"
import CustomError from "../utils/customError.js"

// CREATE SALARY
export const createSalary = asyncHandler(async (req, res) => {
    const {
        teacherId,
        month,
        year,
        basicSalary,
        bonus = 0,
        deductions = 0,
        paymentStatus = "PENDING",
        paymentDate,
        paymentMode,
        referenceNumber,
        remarks
    } = req.body;

    const basic = parseFloat(basicSalary);
    const bon = parseFloat(bonus);
    const ded = parseFloat(deductions);
    const netSalary = basic + bon - ded;

    // Retrieve Franchise ID if the creator is a Franchise Admin
    let franchiseId = null;
    if (req.user.role === "FRANCHISE") {
        const franchise = await prisma.franchise.findUnique({
            where: { userId: req.user.id }
        });
        if (franchise) {
            franchiseId = franchise.id;
        }
    }

    // Check if Teacher exists
    const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) }
    });
    if (!teacher) {
        throw new CustomError("Teacher not found", 404);
    }

    // Check if record already exists for this month & year
    const existing = await prisma.salary.findUnique({
        where: {
            teacherId_month_year: {
                teacherId: parseInt(teacherId),
                month: parseInt(month),
                year: parseInt(year)
            }
        }
    });

    if (existing) {
        throw new CustomError("Salary record for this teacher, month, and year already exists", 400);
    }

    const salary = await prisma.salary.create({
        data: {
            teacherId: parseInt(teacherId),
            franchiseId,
            month: parseInt(month),
            year: parseInt(year),
            basicSalary: basic,
            bonus: bon,
            deductions: ded,
            netSalary,
            paymentStatus,
            paymentDate: paymentDate ? new Date(paymentDate) : null,
            paymentMode,
            referenceNumber,
            remarks
        },
        include: {
            teacher: true,
            franchise: true
        }
    });

    res.status(201).json({
        success: true,
        message: "Salary record created successfully",
        data: salary
    });
});

// UPDATE SALARY
export const updateSalary = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        basicSalary,
        bonus,
        deductions,
        paymentStatus,
        paymentDate,
        paymentMode,
        referenceNumber,
        remarks
    } = req.body;

    const existingSalary = await prisma.salary.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingSalary) {
        throw new CustomError("Salary record not found", 404);
    }

    // Calculations
    const basic = basicSalary !== undefined ? parseFloat(basicSalary) : existingSalary.basicSalary;
    const bon = bonus !== undefined ? parseFloat(bonus) : existingSalary.bonus;
    const ded = deductions !== undefined ? parseFloat(deductions) : existingSalary.deductions;
    const netSalary = basic + bon - ded;

    const updated = await prisma.salary.update({
        where: { id: parseInt(id) },
        data: {
            basicSalary: basic,
            bonus: bon,
            deductions: ded,
            netSalary,
            paymentStatus: paymentStatus || existingSalary.paymentStatus,
            paymentDate: paymentDate ? new Date(paymentDate) : existingSalary.paymentDate,
            paymentMode: paymentMode !== undefined ? paymentMode : existingSalary.paymentMode,
            referenceNumber: referenceNumber !== undefined ? referenceNumber : existingSalary.referenceNumber,
            remarks: remarks !== undefined ? remarks : existingSalary.remarks
        },
        include: {
            teacher: true,
            franchise: true
        }
    });

    res.status(200).json({
        success: true,
        message: "Salary record updated successfully",
        data: updated
    });
});

// MARK AS PAID
export const markSalaryAsPaid = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paymentDate, paymentMode, referenceNumber, remarks } = req.body;

    const existingSalary = await prisma.salary.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingSalary) {
        throw new CustomError("Salary record not found", 404);
    }

    const updated = await prisma.salary.update({
        where: { id: parseInt(id) },
        data: {
            paymentStatus: "PAID",
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            paymentMode: paymentMode || "Bank Transfer",
            referenceNumber: referenceNumber || null,
            remarks: remarks || existingSalary.remarks
        },
        include: {
            teacher: true,
            franchise: true
        }
    });

    res.status(200).json({
        success: true,
        message: "Salary marked as Paid successfully",
        data: updated
    });
});

// GET SALARY HISTORY (Franchise/Admin View)
export const getSalaryHistory = asyncHandler(async (req, res) => {
    const { teacherId } = req.query;

    const where = {};
    if (teacherId) {
        where.teacherId = parseInt(teacherId);
    }

    // Filter by Franchise if Franchise Admin
    if (req.user.role === "FRANCHISE") {
        const franchise = await prisma.franchise.findUnique({
            where: { userId: req.user.id }
        });
        if (franchise) {
            where.franchiseId = franchise.id;
        }
    }

    const salaries = await prisma.salary.findMany({
        where,
        include: {
            teacher: true,
            franchise: true
        },
        orderBy: [
            { year: "desc" },
            { month: "desc" }
        ]
    });

    res.status(200).json({
        success: true,
        data: salaries
    });
});

// GET TEACHER SALARY HISTORY (Self View)
export const getTeacherSalaryHistory = asyncHandler(async (req, res) => {
    const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id }
    });

    if (!teacher) {
        return res.status(200).json({
            success: true,
            data: []
        });
    }

    const salaries = await prisma.salary.findMany({
        where: {
            teacherId: teacher.id
        },
        include: {
            teacher: true,
            franchise: true
        },
        orderBy: [
            { year: "desc" },
            { month: "desc" }
        ]
    });

    res.status(200).json({
        success: true,
        data: salaries
    });
});

// GET SALARY DETAILS
export const getSalaryDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const salary = await prisma.salary.findUnique({
        where: { id: parseInt(id) },
        include: {
            teacher: {
                include: {
                    user: true
                }
            },
            franchise: true
        }
    });

    if (!salary) {
        throw new CustomError("Salary record not found", 404);
    }

    // Access Check: Teacher can only view their own
    if (req.user.role === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id }
        });
        if (!teacher || salary.teacherId !== teacher.id) {
            throw new CustomError("Access denied", 403);
        }
    }

    res.status(200).json({
        success: true,
        data: salary
    });
});
