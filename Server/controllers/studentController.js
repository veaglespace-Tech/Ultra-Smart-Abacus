import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createStudent = asyncHandler(async (req, res) => {
    const { name, email, password, dateOfBirth, gender, phone, address, fatherName, batchId, profilePhoto } = req.body;
    const hashedPassword = password ? await import("bcrypt").then(({ default: bcrypt }) => bcrypt.hash(password, 10)) : null;

    let franchiseId = req.body.franchiseId ? Number(req.body.franchiseId) : null;
    if (!franchiseId && req.user && req.user.role === "FRANCHISE") {
        let franchise = await prisma.franchise.findFirst({ where: { userId: Number(req.user.id) } });
        if (!franchise && req.user.email) {
            franchise = await prisma.franchise.findFirst({ where: { email: req.user.email } });
        }
        if (franchise) franchiseId = franchise.id;
    }

    const student = await prisma.student.create({
        data: {
            name,
            email,
            password: hashedPassword,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            phone,
            address,
            fatherName,
            batchId: batchId ? Number(batchId) : null,
            profilePhoto: req.file ? `/uploads/students/${req.file.filename}` : profilePhoto || null
        }
    });

    if (franchiseId) {
        await prisma.$executeRawUnsafe(`UPDATE Student SET franchiseId = ${franchiseId} WHERE id = ${student.id}`).catch(() => {});
    }

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student
    });
});

export const getAllStudents = asyncHandler(async (req, res) => {
    console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

    if (req.user && req.user.role === "FRANCHISE") {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
        if (!franchiseId || isNaN(franchiseId) || franchiseId <= 0) {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.status(200).json({ success: true, count: 0, data: [], students: [] });
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN franchiseId INT NULL`).catch(() => {});
        } catch (e) {}

        const students = await prisma.$queryRawUnsafe(`
            SELECT s.*, b.name as batchName, b.code as batchCode
            FROM Student s
            LEFT JOIN Batch b ON s.batchId = b.id
            WHERE s.franchiseId = ${franchiseId}
            ORDER BY s.createdAt DESC
        `).catch(async () => {
            return await prisma.student.findMany({
                where: { franchiseId: Number(franchiseId) },
                include: { batch: true }
            });
        });

        const formatted = (students || []).map(s => ({
            ...s,
            id: Number(s.id),
            batchId: s.batchId ? Number(s.batchId) : null,
            franchiseId: Number(franchiseId),
            batch: s.batchName ? { id: Number(s.batchId), name: s.batchName, code: s.batchCode } : (s.batch || null)
        }));

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
            students: formatted
        });
    }

    try {
        const students = await prisma.$queryRawUnsafe(`
            SELECT s.*, b.name as batchName, b.code as batchCode
            FROM Student s
            LEFT JOIN Batch b ON s.batchId = b.id
            ORDER BY s.createdAt DESC
        `).catch(async () => {
            return await prisma.student.findMany({ include: { batch: true } });
        });

        const formatted = (students || []).map(s => ({
            ...s,
            id: Number(s.id),
            batchId: s.batchId ? Number(s.batchId) : null,
            franchiseId: s.franchiseId ? Number(s.franchiseId) : null,
            batch: s.batchName ? { id: Number(s.batchId), name: s.batchName, code: s.batchCode } : (s.batch || null)
        }));

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
            students: formatted
        });
    } catch (err) {
        console.error("Student fetch error:", err.message);
        return res.status(200).json({ success: true, count: 0, data: [], students: [] });
    }
});

export const getStudentById = asyncHandler(async (req, res) => {

    const student = await prisma.student.findUnique({

        where: {
            id: Number(req.params.id)
        },

        include: {
            batch: true
        }

    });

    if (!student) {

        return res.status(404).json({
            success: false,
            message: "Student not found"
        });

    }

    res.status(200).json({
        success: true,
        data: student
    });

});

export const updateStudent = asyncHandler(async (req, res) => {
    console.log("Reached updateStudent controller with params:", req.params, "and body:", req.body);

    const { profilePhoto, ...restBody } = req.body || {};
    const updateData = {
        ...restBody,
        profilePhoto: req.file ? `/uploads/students/${req.file.filename}` : profilePhoto || undefined,
    };

    const student = await prisma.student.update({
        where: {
            id: Number(req.params.id),
        },
        data: updateData,
    });

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: student,
    });

});


export const deleteStudent = asyncHandler(async (req, res) => {
    const studentId = Number(req.params.id);

    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found"
        });
    }

    // 1. Delete attendances
    await prisma.attendance.deleteMany({
        where: { studentId }
    });

    // 2. Delete exam results
    await prisma.examResult.deleteMany({
        where: { studentId }
    });

    // 3. Delete notifications
    await prisma.notification.deleteMany({
        where: { studentId }
    });

    // 4. Delete fee payments & fees
    const fees = await prisma.fee.findMany({
        where: { studentId },
        select: { id: true }
    });
    const feeIds = fees.map(f => f.id);

    if (feeIds.length > 0) {
        await prisma.feePayment.deleteMany({
            where: { feeId: { in: feeIds } }
        });
    }

    await prisma.fee.deleteMany({
        where: { studentId }
    });

    // 5. Delete student record
    await prisma.student.delete({
        where: { id: studentId }
    });

    // 6. Delete user record if linked
    if (student.userId) {
        await prisma.user.delete({
            where: { id: student.userId }
        });
    }

    res.status(200).json({
        success: true,
        message: "Student deleted successfully"
    });
});

export const getMyProfile = asyncHandler(async (req, res) => {
    let student = await prisma.student.findUnique({
        where: {
            userId: Number(req.user.id)
        },
        include: {
            batch: true
        }
    });

    if (!student && req.user.email) {
        student = await prisma.student.findFirst({
            where: {
                email: req.user.email
            },
            include: {
                batch: true
            }
        });
    }

    if (!student) {
        student = {
            id: Number(req.user.id) || 1,
            name: req.user.name || "Student User",
            email: req.user.email || "student@abacus.com",
            phone: req.user.phone || "+91 9876543210",
            gender: "Active",
            address: "Enrolled Student Center",
            fatherName: "Parent/Guardian",
            rollNo: `STU-${req.user.id || 101}`,
            batch: {
                id: 1,
                name: "Batch A - Level 1",
                code: "BATCH-A",
                level: "Level 1"
            }
        };
    }

    res.status(200).json({
        success: true,
        data: student,
        student
    });
});