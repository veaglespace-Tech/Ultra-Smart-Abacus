import prisma from "../config/prisma.js"



export const createInventory = async(req,res,next)=>{


try{


const {
itemName,
description,
quantity,
price
}=req.body



const inventory =
await prisma.inventory.create({

data:{

itemName,

description,

quantity,

price

}

})



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


try{


const inventories =
await prisma.inventory.findMany()



res.json({

success:true,

count:inventories.length,

inventories

})


}
catch(error){

next(error)

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