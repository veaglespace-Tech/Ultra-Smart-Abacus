import prisma from "../config/prisma.js";

import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/customError.js";


// Mark Attendance


export const markAttendance = asyncHandler(async (req, res) => {

    const {
        studentId,
        teacherId,
        batchId,
        status,
        remarks
    } = req.body;

    // Check Student

    const student = await prisma.student.findUnique({

        where: {
            id: Number(studentId)
        }
    });

    if (!student) {

        throw new CustomError(
            "Student not found",
            404
        );
    }

    // Check Teacher

    const teacher = await prisma.teacher.findUnique({

        where: {
            id: Number(teacherId)
        }
    });

    if (!teacher) {

        throw new CustomError(
            "Teacher not found",
            404
        );
    }

    // Check Batch

    const batch = await prisma.batch.findUnique({

        where: {
            id: Number(batchId)
        }
    });

    if (!batch) {

        throw new CustomError(
            "Batch not found",
            404
        );
    }

    // Duplicate Attendance Check

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const alreadyMarked =
        await prisma.attendance.findFirst({

            where: {

                studentId: Number(studentId),

                attendanceDate: {

                    gte: today,

                    lt: tomorrow
                }
            }
        });

    if (alreadyMarked) {

        throw new CustomError(
            "Attendance already marked for this student today",
            400
        );
    }

    const attendance =
        await prisma.attendance.create({

            data: {

                studentId: Number(studentId),

                teacherId: Number(teacherId),

                batchId: Number(batchId),

                status,

                remarks
            },

            include: {

                student: true,

                teacher: true,

                batch: true
            }
        });

    res.status(201).json({

        success: true,

        message: "Attendance marked successfully",

        attendance
    });

});



// Get Attendance By Student


export const getAttendanceByStudent =
asyncHandler(async (req, res) => {

    const { studentId } = req.params;

    const attendance =
        await prisma.attendance.findMany({

            where: {

                studentId: Number(studentId)
            },

            include: {

                student: true,

                teacher: true,

                batch: true
            },

            orderBy: {

                attendanceDate: "desc"
            }
        });

    if (!attendance.length) {

        throw new CustomError(
            "Attendance not found",
            404
        );
    }

    res.status(200).json({

        success: true,

        message: "Attendance fetched successfully",

        attendance
    });

});



// Get All Attendance


export const getAllAttendance =
asyncHandler(async (req, res) => {
    console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

    if (req.user && req.user.role === "FRANCHISE") {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
        if (!franchiseId || isNaN(franchiseId)) {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.status(200).json({ success: true, count: 0, attendance: [] });
        }
    }

    const { batchId, date } = req.query;

    const where = {};
    if (req.user && req.user.role === "FRANCHISE") {
        where.student = { franchiseId: Number(req.user.franchiseId) };
    }
    if (batchId) {
        where.batchId = Number(batchId);
    }
    if (date) {
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 1);
        where.attendanceDate = {
            gte: startDate,
            lt: endDate
        };
    }

    const attendance =
        await prisma.attendance.findMany({
            where,
            include: {
                student: true,
                teacher: true,
                batch: true
            },
            orderBy: {
                attendanceDate: "desc"
            }
        });

    res.status(200).json({
        success: true,
        message: "Attendance list fetched successfully",
        attendance
    });
});



// Update Attendance



export const updateAttendance =
asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {

        status,

        remarks

    } = req.body;

    const attendance =
        await prisma.attendance.findUnique({

            where: {

                id: Number(id)
            }
        });

    if (!attendance) {

        throw new CustomError(
            "Attendance not found",
            404
        );
    }

    const updatedAttendance =
        await prisma.attendance.update({

            where: {

                id: Number(id)
            },

            data: {

                status,

                remarks
            },

            include: {

                student: true,

                teacher: true,

                batch: true
            }
        });

    res.status(200).json({

        success: true,

        message: "Attendance updated successfully",

        attendance: updatedAttendance
    });

});



// Delete Attendance


export const deleteAttendance =
asyncHandler(async (req, res) => {

    const { id } = req.params;

    const attendance =
        await prisma.attendance.findUnique({

            where: {

                id: Number(id)
            }
        });

    if (!attendance) {

        throw new CustomError(
            "Attendance not found",
            404
        );
    }

    await prisma.attendance.delete({

        where: {

            id: Number(id)
        }
    });

    res.status(200).json({

        success: true,

        message: "Attendance deleted successfully"
    });

});