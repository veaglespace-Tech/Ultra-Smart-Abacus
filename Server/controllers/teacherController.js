import prisma from "../config/prisma.js"

import bcrypt from "bcrypt"



export const registerTeacher = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            qualification,
            experience,
            specialization,
            phone,
            documents
        } = req.body;

        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password || "teacher123", 10);

        let franchiseId = req.body.franchiseId ? Number(req.body.franchiseId) : null;
        if (!franchiseId && req.user && req.user.role === "FRANCHISE") {
            let franchise = await prisma.franchise.findFirst({ where: { userId: Number(req.user.id) } });
            if (!franchise && req.user.email) {
                franchise = await prisma.franchise.findFirst({ where: { email: req.user.email } });
            }
            if (franchise) franchiseId = franchise.id;
        }

        let documentsStr = null;
        if (documents !== undefined && documents !== null) {
            documentsStr = typeof documents === 'object' ? JSON.stringify(documents) : String(documents);
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role: "TEACHER"
            }
        });

        const teacher = await prisma.teacher.create({
            data: {
                name,
                qualification: qualification || "Abacus Certified Instructor",
                experience: experience ? parseInt(experience) : 1,
                phone: phone || "",
                specialization: specialization || "Abacus Math",
                userId: user.id,
                documents: documentsStr
            }
        });

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE Teacher ADD COLUMN documents LONGTEXT NULL`).catch(() => {});
            if (documentsStr) {
                const escaped = documentsStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET documents = '${escaped}' WHERE id = ${teacher.id}`).catch(() => {});
            }
        } catch (e) {}

        if (franchiseId) {
            await prisma.$executeRawUnsafe(`UPDATE Teacher SET franchiseId = ${franchiseId} WHERE id = ${teacher.id}`).catch(() => {});
        }

        res.status(201).json({
            success: true,
            message: "Teacher registered successfully",
            data: teacher,
            teacher
        });
    } catch (error) {
        next(error);
    }
};






export const getTeachers = async (req, res, next) => {
    console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

    if (req.user && req.user.role === "FRANCHISE") {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
        if (!franchiseId || isNaN(franchiseId) || franchiseId <= 0) {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.json({ success: true, count: 0, data: [], teachers: [] });
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE Teacher ADD COLUMN franchiseId INT NULL`).catch(() => {});
        } catch (e) {}

        const teachers = await prisma.$queryRawUnsafe(`
            SELECT t.*, u.email as userEmail, u.name as userName, u.role as userRole, u.createdAt as userCreatedAt
            FROM Teacher t
            LEFT JOIN User u ON t.userId = u.id
            WHERE t.franchiseId = ${franchiseId}
            ORDER BY t.id DESC
        `).catch(async () => {
            return await prisma.teacher.findMany({
                where: { franchiseId: Number(franchiseId) },
                include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } }
            });
        });

        const formatted = (teachers || []).map(t => ({
            ...t,
            id: Number(t.id),
            userId: t.userId ? Number(t.userId) : null,
            franchiseId: Number(franchiseId),
            user: t.userEmail ? {
                id: Number(t.userId),
                name: t.userName || t.name,
                email: t.userEmail,
                role: t.userRole || "TEACHER",
                createdAt: t.userCreatedAt
            } : (t.user || null)
        }));

        return res.json({
            success: true,
            count: formatted.length,
            data: formatted,
            teachers: formatted
        });
    }

    try {
        let teachers;
        try {
            teachers = await prisma.$queryRawUnsafe(`
                SELECT t.*, u.email as userEmail, u.name as userName, u.role as userRole, u.createdAt as userCreatedAt
                FROM Teacher t
                LEFT JOIN User u ON t.userId = u.id
                ORDER BY t.id DESC
            `);
        } catch (err1) {
            teachers = await prisma.$queryRawUnsafe(`
                SELECT t.*, u.email as userEmail, u.name as userName, u.role as userRole, u.createdAt as userCreatedAt
                FROM teacher t
                LEFT JOIN user u ON t.userId = u.id
                ORDER BY t.id DESC
            `);
        }

        let formatted = (teachers || []).map(t => ({
            ...t,
            id: Number(t.id),
            userId: t.userId ? Number(t.userId) : null,
            franchiseId: t.franchiseId ? Number(t.franchiseId) : null,
            user: t.userEmail ? {
                id: Number(t.userId),
                name: t.userName || t.name,
                email: t.userEmail,
                role: t.userRole || "TEACHER",
                createdAt: t.userCreatedAt
            } : null
        }));

        return res.json({
            success: true,
            count: formatted.length,
            data: formatted,
            teachers: formatted
        });
    } catch (error) {
        console.error("Teacher fetch error:", error.message);
        return res.json({ success: true, count: 0, data: [], teachers: [] });
    }
};

export const updateTeacher = async (req, res, next) => {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Teacher ADD COLUMN documents LONGTEXT NULL`).catch(() => {});
        await prisma.$executeRawUnsafe(`ALTER TABLE Teacher ADD COLUMN profilePhoto LONGTEXT NULL`).catch(() => {});

        const { id } = req.params;
        const { name, qualification, experience, documents, profilePhoto, phone, email } = req.body || {};

        let documentsStr = undefined;
        if (documents !== undefined && documents !== null) {
            documentsStr = typeof documents === 'object' ? JSON.stringify(documents) : String(documents);
        }

        // 1. ID Resolution (Matches Student Controller Logic)
        let idNum = Number(id);
        let existingTeacher = null;

        if (!isNaN(idNum) && idNum > 0) {
            existingTeacher = await prisma.teacher.findUnique({ where: { id: idNum } }).catch(() => null);
            if (!existingTeacher) {
                existingTeacher = await prisma.teacher.findFirst({
                    where: {
                        OR: [
                            { userId: idNum },
                            { userId: Number(req.user?.id || 0) }
                        ]
                    }
                }).catch(() => null);
            }
        }

        if (!existingTeacher && req.user) {
            existingTeacher = await prisma.teacher.findFirst({
                where: { userId: Number(req.user.id) }
            }).catch(() => null);
        }

        let targetUserId = existingTeacher ? existingTeacher.userId : (req.user?.id ? Number(req.user.id) : (!isNaN(idNum) && idNum > 0 ? idNum : null));

        if (!existingTeacher && targetUserId) {
            const u = await prisma.user.findUnique({ where: { id: targetUserId } }).catch(() => null);
            if (u) {
                existingTeacher = await prisma.teacher.create({
                    data: {
                        name: name || u.name || "Teacher",
                        qualification: qualification || "Abacus Certified Instructor",
                        experience: experience !== undefined && experience !== null ? parseInt(experience) : 1,
                        phone: phone || u.phone || "",
                        userId: u.id,
                    }
                }).catch(async () => {
                    const cleanName = (name || u.name || "Teacher").replace(/'/g, "\\'");
                    const cleanQual = (qualification || "Abacus Certified Instructor").replace(/'/g, "\\'");
                    const cleanPhone = (phone || u.phone || "").replace(/'/g, "\\'");
                    await prisma.$executeRawUnsafe(`INSERT INTO Teacher (name, qualification, experience, phone, userId) VALUES ('${cleanName}', '${cleanQual}', 1, '${cleanPhone}', ${u.id})`).catch(() => {});
                    return await prisma.teacher.findFirst({ where: { userId: u.id } }).catch(() => null);
                });
            }
        }

        const targetId = existingTeacher ? existingTeacher.id : (!isNaN(idNum) && idNum > 0 ? idNum : null);
        if (existingTeacher && existingTeacher.userId) {
            targetUserId = existingTeacher.userId;
        }

        // 2. Direct Raw SQL Updates (Identical to Student Document Storage Logic)
        if (documentsStr !== undefined && (targetId || targetUserId)) {
            const escaped = documentsStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            if (targetId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET documents = '${escaped}' WHERE id = ${targetId}`).catch(() => {});
            }
            if (targetUserId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET documents = '${escaped}' WHERE userId = ${targetUserId}`).catch(() => {});
            }
        }

        if (profilePhoto !== undefined && (targetId || targetUserId)) {
            const escapedPhoto = (profilePhoto || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            if (targetId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET profilePhoto = '${escapedPhoto}' WHERE id = ${targetId}`).catch(() => {});
            }
            if (targetUserId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET profilePhoto = '${escapedPhoto}' WHERE userId = ${targetUserId}`).catch(() => {});
            }
        }

        // Update name, qualification, experience, phone
        const fieldUpdates = [];
        if (name) fieldUpdates.push(`name = '${name.replace(/'/g, "\\'")}'`);
        if (qualification) fieldUpdates.push(`qualification = '${qualification.replace(/'/g, "\\'")}'`);
        if (experience !== undefined && experience !== null) fieldUpdates.push(`experience = ${parseInt(experience) || 0}`);
        if (phone) fieldUpdates.push(`phone = '${phone.replace(/'/g, "\\'")}'`);

        if (fieldUpdates.length > 0) {
            if (targetId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET ${fieldUpdates.join(', ')} WHERE id = ${targetId}`).catch(() => {});
            }
            if (targetUserId) {
                await prisma.$executeRawUnsafe(`UPDATE Teacher SET ${fieldUpdates.join(', ')} WHERE userId = ${targetUserId}`).catch(() => {});
            }
        }

        if ((name || email) && targetUserId) {
            const userUpdates = [];
            if (name) userUpdates.push(`name = '${name.replace(/'/g, "\\'")}'`);
            if (email) userUpdates.push(`email = '${email.replace(/'/g, "\\'")}'`);
            if (userUpdates.length > 0) {
                await prisma.$executeRawUnsafe(`UPDATE User SET ${userUpdates.join(', ')} WHERE id = ${targetUserId}`).catch(() => {});
            }
        }

        let updatedTeacher = targetId ? await prisma.teacher.findUnique({ where: { id: targetId } }).catch(() => null) : null;
        if (!updatedTeacher && targetUserId) {
            updatedTeacher = await prisma.teacher.findFirst({ where: { userId: targetUserId } }).catch(() => null);
        }

        let formattedDocs = updatedTeacher?.documents || documentsStr;
        if (typeof formattedDocs === 'string') {
            try { formattedDocs = JSON.parse(formattedDocs); } catch (e) {}
        }

        res.json({
            success: true,
            message: "Teacher updated successfully",
            data: {
                ...(updatedTeacher || {}),
                documents: formattedDocs
            },
            teacher: {
                ...(updatedTeacher || {}),
                documents: formattedDocs
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTeacher = async(req,res,next)=>{
try{
const { id } = req.params

const teacher = await prisma.teacher.findUnique({
where:{
id: Number(id)
}
})

if(!teacher){
return res.status(404).json({
message:"Teacher not found"
})
}

// 1. Delete attendance records for this teacher
await prisma.attendance.deleteMany({
where: { teacherId: Number(id) }
});

// 2. Delete salary records for this teacher
await prisma.salary.deleteMany({
where: { teacherId: Number(id) }
});

// 3. Delete teacher record
await prisma.teacher.delete({
where:{
id: Number(id)
}
})

// 4. Delete related user record
if (teacher.userId) {
await prisma.user.delete({
where:{
id: teacher.userId
}
})
}

res.json({
success:true,
message:"Teacher deleted successfully"
})

}
catch(error){
next(error)
}
}