import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBatch = asyncHandler(async (req, res) => {
    const {
        name,
        code,
        courseId,
        description,
        level,
        startDate,
        endDate,
        maxStudents
    } = req.body;

    let franchiseId = req.body.franchiseId ? Number(req.body.franchiseId) : null;
    if (!franchiseId && req.user && req.user.role === "FRANCHISE") {
        let franchise = await prisma.franchise.findFirst({ where: { userId: Number(req.user.id) } });
        if (!franchise) {
            const u = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
            if (u) {
                franchise = await prisma.franchise.findFirst({ where: { email: u.email } });
            }
        }
        if (franchise) franchiseId = franchise.id;
    }

    try {
        const batch = await prisma.batch.create({
            data: {
                name,
                code: code || `BATCH-${Date.now()}`,
                courseId: courseId ? Number(courseId) : null,
                description,
                level,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxStudents: maxStudents ? Number(maxStudents) : null
            },
            include: {
                course: true
            }
        });

        if (franchiseId) {
            await prisma.$executeRawUnsafe(`UPDATE Batch SET franchiseId = ${franchiseId} WHERE id = ${batch.id}`).catch(() => {});
        }

        res.status(201).json({
            success: true,
            message: "Batch created successfully",
            data: batch
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export const getAllBatches = asyncHandler(async (req, res) => {
    console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

    if (req.user && req.user.role === "FRANCHISE") {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
        if (!franchiseId || isNaN(franchiseId) || franchiseId <= 0) {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.status(200).json({ success: true, count: 0, data: [], batches: [] });
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE Batch ADD COLUMN franchiseId INT NULL`).catch(() => {});
        } catch (e) {}

        const batches = await prisma.$queryRawUnsafe(`
            SELECT b.*, c.name as courseName, c.code as courseCode
            FROM Batch b
            LEFT JOIN Course c ON b.courseId = c.id
            WHERE b.franchiseId = ${franchiseId}
            ORDER BY b.createdAt DESC
        `).catch(async () => {
            return await prisma.batch.findMany({
                where: { franchiseId: Number(franchiseId) },
                include: { course: true }
            });
        });

        const allStudents = await prisma.$queryRawUnsafe(`SELECT id, name, email, batchId FROM Student WHERE franchiseId = ${franchiseId}`).catch(() => []);

        const formatted = (batches || []).map(b => {
            const bId = Number(b.id);
            const bIdStr = String(b.id).trim().toLowerCase();
            const bCodeStr = b.code ? String(b.code).trim().toLowerCase() : "";
            const bNameStr = b.name ? String(b.name).trim().toLowerCase() : "";

            const assignedStudents = (allStudents || [])
                .filter(s => {
                    if (s.batchId === null || s.batchId === undefined || s.batchId === "") return false;
                    const sBatchStr = String(s.batchId).trim().toLowerCase();
                    return (
                        sBatchStr === bIdStr ||
                        (bCodeStr && sBatchStr === bCodeStr) ||
                        (bNameStr && sBatchStr === bNameStr) ||
                        Number(s.batchId) === bId
                    );
                })
                .map(s => ({ ...s, id: Number(s.id), batchId: bId }));

            return {
                ...b,
                id: bId,
                courseId: b.courseId ? Number(b.courseId) : null,
                franchiseId: Number(franchiseId),
                maxStudents: b.maxStudents ? Number(b.maxStudents) : 30,
                course: b.courseName ? { id: Number(b.courseId), name: b.courseName, code: b.courseCode } : (b.course || null),
                students: assignedStudents,
                studentCount: assignedStudents.length,
                _count: { students: assignedStudents.length }
            };
        });

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
            batches: formatted
        });
    }

    try {
        const batches = await prisma.$queryRawUnsafe(`
            SELECT b.*, c.name as courseName, c.code as courseCode
            FROM Batch b
            LEFT JOIN Course c ON b.courseId = c.id
            ORDER BY b.createdAt DESC
        `).catch(async () => {
            return await prisma.batch.findMany({ include: { course: true } });
        });

        const allStudents = await prisma.$queryRawUnsafe(`SELECT id, name, email, batchId FROM Student`).catch(() => []);

        const formatted = (batches || []).map(b => {
            const bId = Number(b.id);
            const bIdStr = String(b.id).trim().toLowerCase();
            const bCodeStr = b.code ? String(b.code).trim().toLowerCase() : "";
            const bNameStr = b.name ? String(b.name).trim().toLowerCase() : "";

            const assignedStudents = (allStudents || [])
                .filter(s => {
                    if (s.batchId === null || s.batchId === undefined || s.batchId === "") return false;
                    const sBatchStr = String(s.batchId).trim().toLowerCase();
                    return (
                        sBatchStr === bIdStr ||
                        (bCodeStr && sBatchStr === bCodeStr) ||
                        (bNameStr && sBatchStr === bNameStr) ||
                        Number(s.batchId) === bId
                    );
                })
                .map(s => ({ ...s, id: Number(s.id), batchId: bId }));

            return {
                ...b,
                id: bId,
                courseId: b.courseId ? Number(b.courseId) : null,
                franchiseId: b.franchiseId ? Number(b.franchiseId) : null,
                maxStudents: b.maxStudents ? Number(b.maxStudents) : 30,
                course: b.courseName ? { id: Number(b.courseId), name: b.courseName, code: b.courseCode } : (b.course || null),
                students: assignedStudents,
                studentCount: assignedStudents.length,
                _count: { students: assignedStudents.length }
            };
        });

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
            batches: formatted
        });
    } catch (err) {
        console.error("Batch query error:", err.message);
        return res.status(200).json({ success: true, count: 0, data: [], batches: [] });
    }
});

export const getBatchById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const batchId = Number(id);

    let batch;
    try {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT b.*, c.name as courseName, c.code as courseCode
            FROM Batch b
            LEFT JOIN Course c ON b.courseId = c.id
            WHERE b.id = ${batchId}
        `);
        batch = rows && rows[0] ? rows[0] : null;
    } catch (e) {
        batch = await prisma.batch.findUnique({ where: { id: batchId } });
    }

    if (!batch) {
        return res.status(404).json({
            success: false,
            message: "Batch not found"
        });
    }

    const bIdStr = String(batch.id).trim().toLowerCase();
    const bCodeStr = batch.code ? String(batch.code).trim().toLowerCase() : "";
    const bNameStr = batch.name ? String(batch.name).trim().toLowerCase() : "";

    const allStudents = await prisma.$queryRawUnsafe(`SELECT id, name, email, batchId FROM Student`).catch(() => []);
    const formattedStudents = (allStudents || [])
        .filter(s => {
            if (s.batchId === null || s.batchId === undefined || s.batchId === "") return false;
            const sBatchStr = String(s.batchId).trim().toLowerCase();
            return (
                sBatchStr === bIdStr ||
                (bCodeStr && sBatchStr === bCodeStr) ||
                (bNameStr && sBatchStr === bNameStr) ||
                Number(s.batchId) === batchId
            );
        })
        .map(s => ({
            ...s,
            id: Number(s.id),
            batchId: batchId
        }));

    res.status(200).json({
        success: true,
        data: {
            ...batch,
            id: Number(batch.id),
            courseId: batch.courseId ? Number(batch.courseId) : null,
            franchiseId: batch.franchiseId ? Number(batch.franchiseId) : null,
            course: batch.courseName ? { id: Number(batch.courseId), name: batch.courseName, code: batch.courseCode } : null,
            students: formattedStudents,
            studentCount: formattedStudents.length,
            _count: { students: formattedStudents.length }
        }
    });
});

export const updateBatch = asyncHandler(async (req, res) => {

    const batch = await prisma.batch.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body,

        include: {
            course: true,
            students: true
        }

    });

    res.status(200).json({

        success: true,
        message: "Batch updated successfully",
        data: batch

    });

});

export const deleteBatch = asyncHandler(async (req, res) => {

    await prisma.batch.delete({

        where: {
            id: Number(req.params.id)
        }

    });

    res.status(200).json({

        success: true,
        message: "Batch deleted successfully"

    });

});

export const getBatchesByCourseId = asyncHandler(async (req, res) => {

    const { courseId } = req.params;

    const batches = await prisma.batch.findMany({

        where: {
            courseId: Number(courseId)
        },

        include: {
            course: true,
            students: true
        }

    });

    res.status(200).json({

        success: true,
        count: batches.length,
        data: batches

    });

});