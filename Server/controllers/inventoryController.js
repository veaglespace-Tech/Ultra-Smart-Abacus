import prisma from "../config/prisma.js"



export const createInventory = async(req,res,next)=>{


try{
await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN franchiseId INT NULL`).catch(() => {});

const {
itemName,
description,
quantity,
price
}=req.body

const franchiseId = req.user && req.user.role === "FRANCHISE" ? req.user.franchiseId : (req.body.franchiseId || null);

const inventory =
await prisma.inventory.create({

data:{

itemName,

description,

quantity: Number(quantity),

price: Number(price)

}

})

if (franchiseId) {
    await prisma.$executeRawUnsafe(`UPDATE Inventory SET franchiseId = ${franchiseId} WHERE id = ${inventory.id}`).catch(() => {});
    inventory.franchiseId = franchiseId;
}

res.status(201).json({

success:true,

message:"Inventory created",

inventory

})


}
catch(error){

next(error)

}

}






export const getInventories = async(req,res,next)=>{
console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

if (req.user && req.user.role === "FRANCHISE") {
    const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
    if (!franchiseId || isNaN(franchiseId) || franchiseId <= 0) {
        console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
        return res.json({ success: true, count: 0, inventories: [] });
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN franchiseId INT NULL`).catch(() => {});
        const inventories = await prisma.$queryRawUnsafe(`SELECT * FROM Inventory WHERE franchiseId = ${franchiseId} ORDER BY createdAt DESC`).catch(async () => {
            return await prisma.inventory.findMany({ where: { franchiseId: Number(franchiseId) } });
        });

        return res.json({
            success: true,
            count: (inventories || []).length,
            inventories: inventories || []
        });
    } catch (e) {
        return res.json({ success: true, count: 0, inventories: [] });
    }
}

try {
    const inventories = await prisma.$queryRawUnsafe(`SELECT * FROM Inventory ORDER BY createdAt DESC`).catch(async () => {
        return await prisma.inventory.findMany();
    });

    return res.json({
        success: true,
        count: (inventories || []).length,
        inventories: inventories || []
    });
} catch(error) {
    next(error);
}
}






export const getInventoryById = async(req,res,next)=>{


try{


const {id}=req.params


const inventory =
await prisma.inventory.findUnique({

where:{
id: Number(id)
}

})


if(!inventory){

return res.status(404).json({

message:"Inventory not found"

})

}



res.json({

success:true,

inventory

})


}
catch(error){

next(error)

}

}






export const updateInventory = async(req,res,next)=>{


try{


const {id}=req.params


const {

itemName,

description,

quantity,

price

}=req.body



const inventory =
await prisma.inventory.update({

where:{
id: Number(id)
},


data:{

itemName,

description,

quantity: quantity !== undefined ? Number(quantity) : undefined,

price: price !== undefined ? Number(price) : undefined

}

})



res.json({

success:true,

message:"Inventory updated",

inventory

})


}
catch(error){

next(error)

}

}







export const deleteInventory = async(req,res,next)=>{


try{


const {id}=req.params



await prisma.inventory.delete({

where:{
id: Number(id)
}

})



res.json({

success:true,

message:"Inventory deleted"

})


}
catch(error){

next(error)

}

}