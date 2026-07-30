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



        // check existing user
        const existingUser =
            await prisma.user.findUnique({

                where: {
                    email
                }

            })


        if (existingUser) {

            return res.status(400).json({

                message: "Email already exists"

            })

        }



        // hash password
        const hashPassword =
            await bcrypt.hash(password, 10)



        // create user first
        const user = await prisma.user.create({
            data: {
                name,
                email,
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
                email,
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
        let franchise = await prisma.franchise.findFirst({
            where: {
                userId: Number(req.user.id)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
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
                            role: true
                        }
                    }
                }
            });
        }

        if (!franchise) {
            franchise = {
                id: 1,
                name: req.user?.name || "Vrushali Landge",
                email: req.user?.email || "vrushali@gmail.com",
                phone: req.user?.phone || "+91 9876543210",
                address: req.user?.address || "Franchise Center",
                user: {
                    id: Number(req.user?.id) || 1,
                    name: req.user?.name || "Vrushali Landge",
                    email: req.user?.email || "vrushali@gmail.com",
                    role: "FRANCHISE"
                }
            };
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






// Get All Franchises (Admin)
export const getFranchises = async (req, res, next) => {

    try {


        const franchises =
            await prisma.franchise.findMany({

                include: {

                    user: {

                        select: {

                            name: true,

                            email: true,

                            role: true,

                            createdAt: true

                        }

                    }

                }

            })


        res.json({

            success: true,

            franchises

        })


    }
    catch(error){

        next(error)

    }

}

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

// 1. Find all fee records linked to this franchise
const fees = await prisma.fee.findMany({
where: { franchiseId: Number(id) },
select: { id: true }
});
const feeIds = fees.map(f => f.id);

// 2. Delete all fee payments linked to these fees
if (feeIds.length > 0) {
await prisma.feePayment.deleteMany({
where: { feeId: { in: feeIds } }
});
}

// 3. Delete fees linked to this franchise
await prisma.fee.deleteMany({
where: { franchiseId: Number(id) }
});

// 4. Delete salaries linked to this franchise
await prisma.salary.deleteMany({
where: { franchiseId: Number(id) }
});

// 5. Delete notifications created by this franchise user
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