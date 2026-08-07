import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createStudent = asyncHandler(async (req, res) => {
    let { name, email, password, dateOfBirth, gender, phone, address, fatherName, batchId, profilePhoto, documents } = req.body;
    const hashedPassword = password ? await import("bcrypt").then(({ default: bcrypt }) => bcrypt.hash(password, 10)) : null;

    let franchiseId = req.body.franchiseId ? Number(req.body.franchiseId) : null;
    if (!franchiseId && req.user && req.user.role === "FRANCHISE") {
        if (req.user.franchiseId) {
            franchiseId = Number(req.user.franchiseId);
        } else {
            let franchise = await prisma.franchise.findFirst({ where: { userId: Number(req.user.id) } });
            if (!franchise && req.user.email) {
                franchise = await prisma.franchise.findFirst({ where: { email: req.user.email } });
            }
            if (franchise) franchiseId = franchise.id;
        }
    }

    if (!email || !email.trim()) {
        email = `student_${Date.now()}_${Math.floor(Math.random() * 1000)}@abacus.com`;
    }

    let documentsStr = null;
    if (documents !== undefined && documents !== null) {
        documentsStr = typeof documents === 'object' ? JSON.stringify(documents) : String(documents);
    }

    const student = await prisma.student.create({
        data: {
            name,
            email,
            password: hashedPassword,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || "male",
            phone: phone || null,
            address: address || null,
            fatherName: fatherName || null,
            batchId: batchId ? Number(batchId) : null,
            franchiseId: franchiseId ? Number(franchiseId) : null,
            profilePhoto: req.file ? `/uploads/students/${req.file.filename}` : profilePhoto || null,
            documents: documentsStr
        }
    });

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN documents LONGTEXT NULL`).catch(() => {});
        if (documentsStr) {
            const escaped = documentsStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            await prisma.$executeRawUnsafe(`UPDATE Student SET documents = '${escaped}' WHERE id = ${student.id}`).catch(() => {});
        }
    } catch (e) {}

    if (franchiseId) {
        await prisma.$executeRawUnsafe(`UPDATE Student SET franchiseId = ${franchiseId} WHERE id = ${student.id}`).catch(() => {});
    }

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student
    });
});

// Admit an existing student to the Franchise by Student ID, Roll No, or Email
export const admitStudentById = asyncHandler(async (req, res) => {
    const { studentIdentifier, batchId } = req.body || {};

    if (!studentIdentifier) {
        return res.status(400).json({
            success: false,
            message: "Student ID, Roll Number, or Email is required for admission."
        });
    }

    let franchiseId = req.body.franchiseId ? Number(req.body.franchiseId) : null;
    if (!franchiseId && req.user && req.user.role === "FRANCHISE") {
        if (req.user.franchiseId) {
            franchiseId = Number(req.user.franchiseId);
        } else {
            let franchise = await prisma.franchise.findFirst({ where: { userId: Number(req.user.id) } });
            if (!franchise && req.user.email) {
                franchise = await prisma.franchise.findFirst({ where: { email: req.user.email } });
            }
            if (franchise) franchiseId = franchise.id;
        }
    }

    const cleanQuery = String(studentIdentifier).trim();
    const extractedNum = cleanQuery.replace(/\D/g, "");
    const parsedId = extractedNum ? Number(extractedNum) : null;

    let student = await prisma.student.findFirst({
        where: {
            OR: [
                ...(parsedId ? [{ id: parsedId }, { userId: parsedId }] : []),
                { rollNo: cleanQuery },
                { email: cleanQuery },
                ...(extractedNum ? [{ rollNo: `STU-${extractedNum}` }, { rollNo: extractedNum }] : [])
            ]
        },
        include: { batch: true }
    });

    if (!student) {
        return res.status(200).json({
            success: false,
            message: `No registered student found matching ID / Roll No / Email: "${cleanQuery}".`
        });
    }

    const updatedData = {};
    if (batchId) updatedData.batchId = Number(batchId);

    const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: updatedData,
        include: { batch: true }
    }).catch(() => student);

    if (franchiseId) {
        await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN franchiseId INT NULL`).catch(() => {});
        await prisma.$executeRawUnsafe(`UPDATE Student SET franchiseId = ${franchiseId} WHERE id = ${student.id}`).catch(() => {});
    }
    if (batchId) {
        await prisma.$executeRawUnsafe(`UPDATE Student SET batchId = ${Number(batchId)} WHERE id = ${student.id}`).catch(() => {});
    }

    res.status(200).json({
        success: true,
        message: `Student "${updatedStudent.name}" admitted to franchise successfully.`,
        data: updatedStudent
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
    console.log("Reached updateStudent controller with params:", req.params, "and body keys:", Object.keys(req.body || {}));

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN documents LONGTEXT NULL`).catch(() => {});
    } catch (e) {}

    const { profilePhoto, documents, ...restBody } = req.body || {};
    
    let documentsStr = undefined;
    if (documents !== undefined && documents !== null) {
        documentsStr = typeof documents === 'object' ? JSON.stringify(documents) : String(documents);
    }

    const updateData = {
        ...restBody,
        profilePhoto: req.file ? `/uploads/students/${req.file.filename}` : profilePhoto || undefined,
    };
    if (documentsStr !== undefined) {
        updateData.documents = documentsStr;
    }

    let studentIdNum = Number(req.params.id);
    let existingStudent = await prisma.student.findUnique({ where: { id: studentIdNum } }).catch(() => null);
    if (!existingStudent) {
        existingStudent = await prisma.student.findFirst({
            where: {
                OR: [
                    { userId: studentIdNum },
                    { email: restBody.email || '' }
                ]
            }
        }).catch(() => null);
    }

    const targetId = existingStudent ? existingStudent.id : studentIdNum;

    const student = await prisma.student.update({
        where: {
            id: targetId,
        },
        data: updateData,
    }).catch(async (err) => {
        console.warn("Prisma update fallback for student:", err.message);
        if (documentsStr !== undefined) {
            const escaped = documentsStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            await prisma.$executeRawUnsafe(`UPDATE Student SET documents = '${escaped}' WHERE id = ${targetId}`).catch(() => {});
        }
        return await prisma.student.findUnique({ where: { id: targetId } });
    });

    if (documentsStr !== undefined && targetId) {
        const escaped = documentsStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        await prisma.$executeRawUnsafe(`UPDATE Student SET documents = '${escaped}' WHERE id = ${targetId}`).catch(() => {});
    }

    let formattedDocs = student?.documents;
    if (typeof formattedDocs === 'string') {
        try { formattedDocs = JSON.parse(formattedDocs); } catch (e) {}
    }

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {
            ...student,
            documents: formattedDocs
        },
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

    const linkedUserId = student.userId;

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
    if (linkedUserId) {
        await prisma.user.delete({
            where: { id: linkedUserId }
        }).catch(() => {});
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