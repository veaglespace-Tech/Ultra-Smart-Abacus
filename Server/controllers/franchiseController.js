import prisma from "../config/prisma.js"

import bcrypt from "bcrypt"

export const getFranchiseMetrics = async (req, res, next) => {
    try {
        const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;

        if (!franchiseId || isNaN(franchiseId)) {
            console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
            return res.json({
                success: true,
                data: { totalStudents: 0, activeTeachers: 0, pendingFees: 0, abacusStock: 0 }
            });
        }

        const [totalStudents, activeTeachers, batchesCount] = await Promise.all([
            prisma.student.count({ where: { franchiseId: Number(franchiseId) } }).catch(() => 0),
            prisma.teacher.count({ where: { franchiseId: Number(franchiseId) } }).catch(() => 0),
            prisma.batch.count({ where: { franchiseId: Number(franchiseId) } }).catch(() => 0),
        ]);

        const fees = await prisma.fee.findMany({ where: { franchiseId: Number(franchiseId), isActive: true } }).catch(() => []);
        const pendingFees = fees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

        return res.json({
            success: true,
            data: {
                totalStudents,
                activeTeachers,
                pendingFees,
                batchesCount
            }
        });
    } catch (error) {
        next(error);
    }
};


// Register Franchise
export const registerFranchise = async (req, res, next) => {

    try {


        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body



        const cleanEmail = email ? email.trim().toLowerCase() : "";

        if (!cleanEmail) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // check existing user or franchise by email
        const existingUser = await prisma.user.findUnique({
            where: {
                email: cleanEmail
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const existingFranchise = await prisma.franchise.findUnique({
            where: {
                email: cleanEmail
            }
        });

        if (existingFranchise) {
            return res.status(400).json({
                message: "Franchise email already exists"
            });
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // create user first
        const user = await prisma.user.create({
            data: {
                name,
                email: cleanEmail,
                password: hashPassword,
                role: "FRANCHISE",
                phone: phone || "",
                city: "",
                address: address || "",
                gender: "MALE"
            }
        });

        // create franchise linked to user
        const franchise = await prisma.franchise.create({
            data: {
                name,
                email: cleanEmail,
                phone: phone || "",
                address: address || "",
                userId: user.id
            }
        });

        await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN franchiseId INT NULL`).catch(() => {});
        await prisma.$executeRawUnsafe(`UPDATE User SET franchiseId = ${franchise.id} WHERE id = ${user.id}`).catch(() => {});



        res.status(201).json({

            success: true,

            message: "Franchise registered",

            franchise

        })


    }
    catch (error) {

        next(error)

    }

}





// Get Franchise Profile
export const getFranchiseProfile = async (req, res, next) => {
    try {
        const userId = Number(req.user.id);
        let franchise = await prisma.franchise.findFirst({
            where: {
                userId: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        phone: true,
                        city: true,
                        address: true
                    }
                }
            }
        });

        if (!franchise && req.user?.email) {
            franchise = await prisma.franchise.findFirst({
                where: {
                    email: req.user.email
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            phone: true,
                            city: true,
                            address: true
                        }
                    }
                }
            });
        }

        let photo = null;
        try {
            const rawUser = await prisma.$queryRawUnsafe(`SELECT profilePhoto FROM User WHERE id = ${userId}`);
            if (rawUser?.[0]?.profilePhoto) {
                photo = rawUser[0].profilePhoto;
            }
            if (!photo && franchise?.id) {
                const rawFranchise = await prisma.$queryRawUnsafe(`SELECT profilePhoto FROM Franchise WHERE id = ${franchise.id}`);
                if (rawFranchise?.[0]?.profilePhoto) {
                    photo = rawFranchise[0].profilePhoto;
                }
            }
        } catch (e) {
            console.error("Error fetching raw profilePhoto:", e);
        }

        if (!franchise) {
            franchise = {
                id: 1,
                name: req.user?.name || "Vrushali Landge",
                email: req.user?.email || "vrushali@gmail.com",
                phone: req.user?.phone || "+91 9876543210",
                address: req.user?.address || "Franchise Center",
                profilePhoto: photo,
                user: {
                    id: userId || 1,
                    name: req.user?.name || "Vrushali Landge",
                    email: req.user?.email || "vrushali@gmail.com",
                    role: "FRANCHISE",
                    profilePhoto: photo
                }
            };
        } else {
            franchise.profilePhoto = photo;
            if (franchise.user) {
                franchise.user.profilePhoto = photo;
            }
        }

        res.json({
            success: true,
            franchise,
            data: franchise
        });
    } catch (error) {
        next(error);
    }
};






export const getFranchises = async (req, res, next) => {
    try {
        const isTargetToDelete = (name, email) => {
            const n = (name || "").toLowerCase();
            const e = (email || "").toLowerCase();
            return (
                n.includes("tejas") || n.includes("kanawade") ||
                n.includes("aditya") || n.includes("more") ||
                n.includes("manager") ||
                e.includes("tejas") || e.includes("aditya") || e.includes("manager")
            );
        };

        // Purge target franchises and users from DB
        const allTargetFranchises = await prisma.franchise.findMany({
            include: { user: true }
        }).catch(() => []);

        for (const f of allTargetFranchises) {
            if (isTargetToDelete(f.name, f.email) || isTargetToDelete(f.user?.name, f.user?.email)) {
                try {
                    await prisma.student.updateMany({ where: { franchiseId: f.id }, data: { franchiseId: null } }).catch(() => {});
                    await prisma.teacher.updateMany({ where: { franchiseId: f.id }, data: { franchiseId: null } }).catch(() => {});
                    await prisma.batch.deleteMany({ where: { franchiseId: f.id } }).catch(() => {});
                    await prisma.fee.deleteMany({ where: { franchiseId: f.id } }).catch(() => {});
                    await prisma.salary.deleteMany({ where: { franchiseId: f.id } }).catch(() => {});
                    await prisma.franchise.delete({ where: { id: f.id } }).catch(() => {});
                    if (f.userId) {
                        await prisma.user.delete({ where: { id: f.userId } }).catch(() => {});
                    }
                } catch (e) {
                    console.error("Purge error:", e.message);
                }
            }
        }

        const allTargetUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: "tejas" } },
                    { name: { contains: "kanawade" } },
                    { name: { contains: "aditya" } },
                    { name: { contains: "more" } },
                    { name: { contains: "manager" } },
                    { email: { contains: "tejas" } },
                    { email: { contains: "aditya" } },
                    { email: { contains: "manager" } }
                ]
            }
        }).catch(() => []);

        for (const u of allTargetUsers) {
            try {
                await prisma.franchise.deleteMany({ where: { userId: u.id } }).catch(() => {});
                await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
            } catch (e) {}
        }

        let franchises = [];
        try {
            franchises = await prisma.franchise.findMany({
                include: {
                    user: true,
                    students: true,
                    teachers: true,
                    batches: true,
                    fees: true
                },
                orderBy: {
                    id: "desc"
                }
            });
        } catch (findErr) {
            console.error("findMany franchise error, falling back to simple query:", findErr.message);
            franchises = await prisma.franchise.findMany().catch(() => []);
        }

        // Filter out any matching target records
        franchises = franchises.filter(f => !isTargetToDelete(f.name, f.email) && !isTargetToDelete(f.user?.name, f.user?.email));

        // Query any users with FRANCHISE role as database fallback
        const franchiseUsers = await prisma.user.findMany({
            where: { role: "FRANCHISE" }
        }).catch(() => []);

        for (const fu of franchiseUsers) {
            if (isTargetToDelete(fu.name, fu.email)) continue;
            const exists = franchises.some(f => f.userId === fu.id || f.email === fu.email);
            if (!exists) {
                franchises.push({
                    id: fu.id,
                    name: fu.name,
                    email: fu.email,
                    phone: fu.phone || "",
                    address: fu.address || "Main Branch",
                    userId: fu.id,
                    user: fu,
                    students: [],
                    teachers: [],
                    batches: [],
                    fees: []
                });
            }
        }

        return res.json({
            success: true,
            franchises,
            data: franchises
        });
    } catch (error) {
        console.error("Error in getFranchises:", error);
        return res.json({
            success: true,
            franchises: [],
            data: []
        });
    }
};

export const updateFranchise = async(req,res,next)=>{

try{


const { id } = req.params


const {
name,
phone,
address
}=req.body



const franchise =
await prisma.franchise.update({

where:{
id: Number(id)
},


data:{

name,

phone,

address

}

})



res.json({

success:true,

message:"Franchise updated",

franchise

})


}
catch(error){

next(error)

}

}

export const deleteFranchise = async(req,res,next)=>{
try{
const { id } = req.params

const franchise = await prisma.franchise.findUnique({
where:{
id: Number(id)
}
})

if(!franchise){
return res.status(404).json({
message:"Franchise not found"
})
}

// 1. Unlink students and teachers from this franchise
await prisma.student.updateMany({
  where: { franchiseId: Number(id) },
  data: { franchiseId: null }
}).catch(() => {});

await prisma.teacher.updateMany({
  where: { franchiseId: Number(id) },
  data: { franchiseId: null }
}).catch(() => {});

// 2. Delete batches linked to this franchise
await prisma.batch.deleteMany({
  where: { franchiseId: Number(id) }
}).catch(() => {});

// 3. Find all fee records linked to this franchise
const fees = await prisma.fee.findMany({
where: { franchiseId: Number(id) },
select: { id: true }
});
const feeIds = fees.map(f => f.id);

// 4. Delete all fee payments linked to these fees
if (feeIds.length > 0) {
await prisma.feePayment.deleteMany({
where: { feeId: { in: feeIds } }
});
}

// 5. Delete fees linked to this franchise
await prisma.fee.deleteMany({
where: { franchiseId: Number(id) }
});

// 6. Delete salaries linked to this franchise
await prisma.salary.deleteMany({
where: { franchiseId: Number(id) }
});

// 7. Delete notifications created by this franchise user
if (franchise.userId) {
await prisma.notification.deleteMany({
where: { createdBy: franchise.userId }
});
}

// 6. Delete the franchise record
await prisma.franchise.delete({
where:{
id: Number(id)
}
})

// 7. Delete the user record
if (franchise.userId) {
await prisma.user.delete({
where:{
id: franchise.userId
}
})
}

res.json({
success:true,
message:"Franchise deleted successfully"
})

}
catch(error){
next(error)
}
}

// Update Franchise Profile
export const updateFranchiseProfile = async (req, res, next) => {
    try {
        const { name, phone, address, city, password, profilePhoto } = req.body;
        const photoValue = req.file ? `/uploads/profiles/${req.file.filename}` : profilePhoto;
        const userId = Number(req.user.id);

        let updateUserData = {};
        if (name) updateUserData.name = name;
        if (phone !== undefined) updateUserData.phone = phone;
        if (address !== undefined) updateUserData.address = address;
        if (city !== undefined) updateUserData.city = city;
        if (password && password.trim().length >= 6) {
            updateUserData.password = await bcrypt.hash(password.trim(), 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateUserData
        });

        let franchise = await prisma.franchise.findFirst({
            where: { userId }
        });

        if (!franchise && req.user?.email) {
            franchise = await prisma.franchise.findFirst({
                where: { email: req.user.email }
            });
        }

        if (franchise) {
            let franchiseUpdateData = {};
            if (name) franchiseUpdateData.name = name;
            if (phone !== undefined) franchiseUpdateData.phone = phone;
            if (address !== undefined) franchiseUpdateData.address = address;

            franchise = await prisma.franchise.update({
                where: { id: franchise.id },
                data: franchiseUpdateData
            });
        }

        if (photoValue !== undefined) {
            try {
                const escapedPhoto = photoValue ? photoValue.replace(/'/g, "''") : null;
                if (escapedPhoto) {
                    await prisma.$executeRawUnsafe(`UPDATE User SET profilePhoto = '${escapedPhoto}' WHERE id = ${userId}`);
                    if (franchise?.id) {
                        await prisma.$executeRawUnsafe(`UPDATE Franchise SET profilePhoto = '${escapedPhoto}' WHERE id = ${franchise.id}`);
                    }
                } else {
                    await prisma.$executeRawUnsafe(`UPDATE User SET profilePhoto = NULL WHERE id = ${userId}`);
                    if (franchise?.id) {
                        await prisma.$executeRawUnsafe(`UPDATE Franchise SET profilePhoto = NULL WHERE id = ${franchise.id}`);
                    }
                }
            } catch (e) {
                console.error("Error updating raw profilePhoto:", e);
            }
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            franchise,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                city: user.city,
                address: user.address,
                profilePhoto: photoValue !== undefined ? photoValue : null
            }
        });
    } catch (error) {
        next(error);
    }
};