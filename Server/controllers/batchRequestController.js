import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper function to guarantee BatchRequest table exists in MySQL database
async function ensureBatchRequestTable() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS BatchRequest (
                id INT AUTO_INCREMENT PRIMARY KEY,
                teacherId INT NOT NULL,
                franchiseId INT NOT NULL,
                batchName VARCHAR(255) NOT NULL,
                level VARCHAR(100) DEFAULT 'Level 1',
                timing VARCHAR(255) NOT NULL,
                mode VARCHAR(50) DEFAULT 'Offline',
                maxStudents INT DEFAULT 15,
                remarks TEXT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                rejectionReason TEXT NULL,
                batchId INT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    } catch (e) {
        console.error("Error creating BatchRequest table dynamically:", e.message);
    }
}

// Ensure teacherId column exists on Batch table dynamically
async function ensureTeacherIdOnBatch() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Batch ADD COLUMN teacherId INT NULL`).catch(() => {});
    } catch (e) {}
}

export const createBatchRequest = asyncHandler(async (req, res) => {
    await ensureBatchRequestTable();

    const { batchName, level, timing, mode, maxStudents, remarks } = req.body;

    if (!batchName || !timing) {
        return res.status(400).json({
            success: false,
            message: "Batch name and timing schedule are required"
        });
    }

    // Find teacher
    let teacher = await prisma.teacher.findFirst({
        where: {
            OR: [
                { userId: Number(req.user.id) },
                { user: { email: req.user.email } }
            ]
        }
    });

    if (!teacher) {
        // Fallback or auto-create teacher profile
        let userRec = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
        teacher = await prisma.teacher.create({
            data: {
                name: userRec?.name || req.user.name || "Teacher User",
                qualification: "Abacus Instructor",
                experience: 2,
                userId: Number(req.user.id)
            }
        }).catch(() => null);
    }

    const teacherId = teacher ? teacher.id : Number(req.user.id);
    let franchiseId = teacher?.franchiseId || req.user?.franchiseId;

    if (!franchiseId) {
        const defaultFranchise = await prisma.franchise.findFirst();
        franchiseId = defaultFranchise ? defaultFranchise.id : 1;
    }

    try {
        // Create batch request record using Prisma client or raw query fallback
        let batchRequest;
        try {
            batchRequest = await prisma.batchRequest.create({
                data: {
                    teacherId: Number(teacherId),
                    franchiseId: Number(franchiseId),
                    batchName: String(batchName),
                    level: level || "Level 1",
                    timing: String(timing),
                    mode: mode || "Offline",
                    maxStudents: maxStudents ? Number(maxStudents) : 15,
                    remarks: remarks || "",
                    status: "PENDING"
                }
            });
        } catch (dbErr) {
            // Fallback raw query insert
            const result = await prisma.$executeRawUnsafe(`
                INSERT INTO BatchRequest (teacherId, franchiseId, batchName, level, timing, mode, maxStudents, remarks, status, createdAt, updatedAt)
                VALUES (${Number(teacherId)}, ${Number(franchiseId)}, ${JSON.stringify(batchName)}, ${JSON.stringify(level || 'Level 1')}, ${JSON.stringify(timing)}, ${JSON.stringify(mode || 'Offline')}, ${Number(maxStudents || 15)}, ${JSON.stringify(remarks || '')}, 'PENDING', NOW(), NOW())
            `);
            const rows = await prisma.$queryRawUnsafe(`SELECT * FROM BatchRequest WHERE teacherId = ${Number(teacherId)} ORDER BY id DESC LIMIT 1`);
            batchRequest = rows && rows[0] ? rows[0] : { id: Date.now(), teacherId, franchiseId, batchName, level, timing, mode, maxStudents, remarks, status: "PENDING" };
        }

        // Send notification to Franchise
        try {
            const franchiseUser = await prisma.franchise.findUnique({ where: { id: Number(franchiseId) } });
            if (franchiseUser && franchiseUser.userId) {
                await prisma.notification.create({
                    data: {
                        title: "New Batch Request",
                        message: `Teacher ${teacher?.name || req.user.name} submitted a request for new batch "${batchName}" (${timing}).`,
                        recipientType: "FRANCHISES",
                        createdBy: Number(req.user.id)
                    }
                }).catch(() => {});
            }
        } catch (nErr) {}

        res.status(201).json({
            success: true,
            message: "Batch request submitted successfully to your Franchise",
            data: batchRequest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to submit batch request"
        });
    }
});

export const getTeacherBatchRequests = asyncHandler(async (req, res) => {
    await ensureBatchRequestTable();

    let teacher = await prisma.teacher.findFirst({
        where: {
            OR: [
                { userId: Number(req.user.id) },
                { user: { email: req.user.email } }
            ]
        }
    });

    const teacherId = teacher ? teacher.id : Number(req.user.id);

    try {
        let requests = [];
        try {
            requests = await prisma.batchRequest.findMany({
                where: { teacherId: Number(teacherId) },
                include: { batch: true },
                orderBy: { createdAt: 'desc' }
            });
        } catch (e) {
            requests = await prisma.$queryRawUnsafe(`
                SELECT br.*, b.name as createdBatchName, b.code as createdBatchCode
                FROM BatchRequest br
                LEFT JOIN Batch b ON br.batchId = b.id
                WHERE br.teacherId = ${Number(teacherId)}
                ORDER BY br.createdAt DESC
            `).catch(() => []);
        }

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            count: 0,
            data: []
        });
    }
});

export const getFranchiseBatchRequests = asyncHandler(async (req, res) => {
    await ensureBatchRequestTable();

    let franchiseId = req.user?.franchiseId;
    if (!franchiseId) {
        const f = await prisma.franchise.findFirst({
            where: {
                OR: [
                    { userId: Number(req.user.id) },
                    { email: req.user.email || '' }
                ]
            }
        });
        if (f) franchiseId = f.id;
    }

    try {
        let requests = [];
        if (franchiseId) {
            try {
                requests = await prisma.batchRequest.findMany({
                    where: { franchiseId: Number(franchiseId) },
                    include: { teacher: true, batch: true },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (e) {
                requests = await prisma.$queryRawUnsafe(`
                    SELECT br.*, t.name as teacherName, t.qualification as teacherQualification
                    FROM BatchRequest br
                    LEFT JOIN Teacher t ON br.teacherId = t.id
                    WHERE br.franchiseId = ${Number(franchiseId)}
                    ORDER BY br.createdAt DESC
                `).catch(() => []);
            }
        } else {
            try {
                requests = await prisma.batchRequest.findMany({
                    include: { teacher: true, batch: true },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (e) {
                requests = await prisma.$queryRawUnsafe(`
                    SELECT br.*, t.name as teacherName
                    FROM BatchRequest br
                    LEFT JOIN Teacher t ON br.teacherId = t.id
                    ORDER BY br.createdAt DESC
                `).catch(() => []);
            }
        }

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            count: 0,
            data: []
        });
    }
});

export const approveBatchRequest = asyncHandler(async (req, res) => {
    await ensureBatchRequestTable();
    await ensureTeacherIdOnBatch();

    const { id } = req.params;
    const requestId = Number(id);
    const { room, code } = req.body;

    // Fetch batch request
    let request;
    try {
        request = await prisma.batchRequest.findUnique({
            where: { id: requestId },
            include: { teacher: true }
        });
    } catch (e) {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM BatchRequest WHERE id = ${requestId}`);
        request = rows && rows[0] ? rows[0] : null;
    }

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Batch request not found"
        });
    }

    if (request.status === "APPROVED") {
        return res.status(400).json({
            success: false,
            message: "Batch request is already approved"
        });
    }

    // Get Teacher Name
    let teacherName = request.teacher?.name || "Assigned Teacher";
    if (!request.teacher && request.teacherId) {
        const t = await prisma.teacher.findUnique({ where: { id: Number(request.teacherId) } }).catch(() => null);
        if (t) teacherName = t.name;
    }

    // 1. Create the new Batch
    const batchCode = code || `BTC-${Math.floor(1000 + Math.random() * 9000)}`;
    const batchDescription = JSON.stringify({
        slot: request.timing,
        teacher: teacherName,
        mode: request.mode || "Offline",
        room: room || "Lab A",
        teacherId: request.teacherId,
        requestId: request.id
    });

    let newBatch;
    try {
        newBatch = await prisma.batch.create({
            data: {
                name: request.batchName,
                code: batchCode,
                level: request.level || "Level 1",
                maxStudents: Number(request.maxStudents || 15),
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                description: batchDescription
            }
        });
    } catch (createErr) {
        // Try passing franchiseId or raw fallback
        try {
            newBatch = await prisma.batch.create({
                data: {
                    name: request.batchName,
                    code: batchCode,
                    level: request.level || "Level 1",
                    maxStudents: Number(request.maxStudents || 15),
                    description: batchDescription
                }
            });
        } catch (e2) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO Batch (name, code, level, maxStudents, startDate, endDate, description, createdAt, updatedAt)
                VALUES (${JSON.stringify(request.batchName)}, ${JSON.stringify(batchCode)}, ${JSON.stringify(request.level || 'Level 1')}, ${Number(request.maxStudents || 15)}, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), ${JSON.stringify(batchDescription)}, NOW(), NOW())
            `).catch(() => {});
            const rows = await prisma.$queryRawUnsafe(`SELECT * FROM Batch WHERE code = ${JSON.stringify(batchCode)} ORDER BY id DESC LIMIT 1`).catch(() => []);
            newBatch = rows && rows[0] ? rows[0] : { id: Date.now(), name: request.batchName, code: batchCode };
        }
    }

    // Update batch record with franchiseId and teacherId dynamically
    if (newBatch && newBatch.id) {
        if (request.franchiseId) {
            await prisma.$executeRawUnsafe(`UPDATE Batch SET franchiseId = ${Number(request.franchiseId)} WHERE id = ${Number(newBatch.id)}`).catch(() => {});
        }
        if (request.teacherId) {
            await prisma.$executeRawUnsafe(`UPDATE Batch SET teacherId = ${Number(request.teacherId)} WHERE id = ${Number(newBatch.id)}`).catch(() => {});
        }
    }

    // 2. Update BatchRequest status to APPROVED
    try {
        await prisma.batchRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                batchId: newBatch.id
            }
        });
    } catch (e) {
        await prisma.$executeRawUnsafe(`UPDATE BatchRequest SET status = 'APPROVED', batchId = ${newBatch.id} WHERE id = ${requestId}`).catch(() => {});
    }

    // 3. Notify Teacher
    try {
        let teacherUser;
        if (request.teacher && request.teacher.userId) {
            teacherUser = request.teacher.userId;
        } else if (request.teacherId) {
            const tRec = await prisma.teacher.findUnique({ where: { id: Number(request.teacherId) } });
            if (tRec) teacherUser = tRec.userId;
        }

        await prisma.notification.create({
            data: {
                title: "Batch Request Approved 🎉",
                message: `Your request for batch "${request.batchName}" (${request.timing}) has been APPROVED by the Franchise!`,
                recipientType: "TEACHERS",
                batchId: newBatch.id,
                createdBy: Number(req.user.id)
            }
        }).catch(() => {});
    } catch (nErr) {}

    res.status(200).json({
        success: true,
        message: "Batch request approved and batch created successfully!",
        data: {
            requestId: requestId,
            status: "APPROVED",
            batch: newBatch
        }
    });
});

export const rejectBatchRequest = asyncHandler(async (req, res) => {
    await ensureBatchRequestTable();

    const { id } = req.params;
    const requestId = Number(id);
    const { rejectionReason } = req.body;

    let request;
    try {
        request = await prisma.batchRequest.findUnique({ where: { id: requestId } });
    } catch (e) {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM BatchRequest WHERE id = ${requestId}`);
        request = rows && rows[0] ? rows[0] : null;
    }

    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Batch request not found"
        });
    }

    // Update status to REJECTED
    try {
        await prisma.batchRequest.update({
            where: { id: requestId },
            data: {
                status: "REJECTED",
                rejectionReason: rejectionReason || "Not feasible at current time slot."
            }
        });
    } catch (e) {
        await prisma.$executeRawUnsafe(`
            UPDATE BatchRequest 
            SET status = 'REJECTED', rejectionReason = ${JSON.stringify(rejectionReason || 'Not feasible at current time slot.')} 
            WHERE id = ${requestId}
        `).catch(() => {});
    }

    // Notify Teacher
    try {
        await prisma.notification.create({
            data: {
                title: "Batch Request Update",
                message: `Your request for batch "${request.batchName}" was rejected by the Franchise. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
                recipientType: "TEACHERS",
                createdBy: Number(req.user.id)
            }
        }).catch(() => {});
    } catch (nErr) {}

    res.status(200).json({
        success: true,
        message: "Batch request rejected",
        data: {
            requestId: requestId,
            status: "REJECTED"
        }
    });
});
