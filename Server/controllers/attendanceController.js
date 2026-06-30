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

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

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

    const attendance =
        await prisma.attendance.findMany({

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