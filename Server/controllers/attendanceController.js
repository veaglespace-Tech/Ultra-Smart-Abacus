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

    const student = await prisma.student.findUnique({
        where: { id: Number(studentId) }
    });
    if (!student) {
        throw new CustomError("Student not found", 404);
    }

    const batch = await prisma.batch.findUnique({
        where: { id: Number(batchId) }
    });
    if (!batch) {
        throw new CustomError("Batch not found", 404);
    }

    if (!student.franchiseId) {
        const targetFranchiseId = batch.franchiseId || (req.user && req.user.franchiseId ? Number(req.user.franchiseId) : null);
        if (targetFranchiseId) {
            await prisma.student.update({
                where: { id: student.id },
                data: { franchiseId: Number(targetFranchiseId) }
            }).catch(() => {});
        }
    }

    // Resolve teacherId dynamically
    let validTeacherId = teacherId ? Number(teacherId) : null;
    if (validTeacherId) {
        const teacherExists = await prisma.teacher.findUnique({ where: { id: validTeacherId } });
        if (!teacherExists) validTeacherId = null;
    }

    if (!validTeacherId && req.user) {
        if (req.user.role === "TEACHER") {
            const t = await prisma.teacher.findFirst({
                where: { OR: [{ userId: Number(req.user.id) }, { email: req.user.email }] }
            });
            if (t) validTeacherId = t.id;
        }
    }

    if (!validTeacherId && batch.teacherId) {
        validTeacherId = batch.teacherId;
    }

    if (!validTeacherId) {
        const anyTeacher = await prisma.teacher.findFirst();
        if (anyTeacher) {
            validTeacherId = anyTeacher.id;
        } else {
            throw new CustomError("No active teacher found to record attendance under", 404);
        }
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const alreadyMarked = await prisma.attendance.findFirst({
        where: {
            studentId: Number(studentId),
            attendanceDate: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    if (alreadyMarked) {
        const updated = await prisma.attendance.update({
            where: { id: alreadyMarked.id },
            data: {
                status,
                remarks: remarks || "",
                teacherId: validTeacherId,
                batchId: Number(batchId)
            },
            include: {
                student: true,
                teacher: true,
                batch: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            attendance: updated
        });
    }

    const attendance = await prisma.attendance.create({
        data: {
            studentId: Number(studentId),
            teacherId: validTeacherId,
            batchId: Number(batchId),
            status,
            remarks: remarks || ""
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


export const getAllAttendance = asyncHandler(async (req, res) => {
    console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

    if (req.user && req.user.role === "FRANCHISE") {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
        if (franchiseId && !isNaN(franchiseId)) {
            // Auto-heal unlinked records for smooth franchise visibility
            await prisma.$executeRawUnsafe(`UPDATE Student SET franchiseId = ${franchiseId} WHERE franchiseId IS NULL`).catch(() => {});
            await prisma.$executeRawUnsafe(`UPDATE Batch SET franchiseId = ${franchiseId} WHERE franchiseId IS NULL`).catch(() => {});
        } else {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.status(200).json({ success: true, count: 0, attendance: [] });
        }
    }

    const { batchId, date } = req.query;

    const where = {};
    if (batchId) {
        where.batchId = Number(batchId);
    } else if (req.user && req.user.role === "FRANCHISE" && req.user.franchiseId) {
        const fid = Number(req.user.franchiseId);
        where.OR = [
            { student: { franchiseId: fid } },
            { batch: { franchiseId: fid } },
            { teacher: { franchiseId: fid } }
        ];
    }

    if (date) {
        let year, month, day;
        const dateStr = String(date).trim();
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                year = Number(parts[0]);
                month = Number(parts[1]) - 1;
                day = Number(parts[2]);
            } else {
                month = Number(parts[0]) - 1;
                day = Number(parts[1]);
                year = Number(parts[2]);
            }
        }

        if (year && !isNaN(month) && day) {
            const startDate = new Date(Date.UTC(year, month, day - 1, 0, 0, 0, 0));
            const endDate = new Date(Date.UTC(year, month, day + 1, 23, 59, 59, 999));
            where.attendanceDate = {
                gte: startDate,
                lte: endDate
            };
        }
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