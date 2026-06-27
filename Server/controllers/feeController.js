import prisma from "../config/prisma.js"


// CREATE FEE
export const createFee = async(req,res)=>{

try{

const {
studentId,
totalAmount,
paidAmount
}=req.body


const paid = paidAmount || 0

const pending = totalAmount - paid


const fee = await prisma.fee.create({

data:{

studentId,

totalAmount,

paidAmount:paid,

pendingAmount:pending,

status:
pending === 0
? "PAID"
:
paid > 0
? "PARTIAL"
:
"PENDING"

}

})


res.status(201).json({
message:"Fee created successfully",
data:fee
})


}
catch(error){

res.status(500).json({
error:error.message
})

}

}



// GET ALL FEES

export const getFees = async(req,res)=>{

try{


const fees = await prisma.fee.findMany()


res.json(fees)


}
catch(error){

res.status(500).json({
error:error.message
})

}

}




// GET SINGLE FEE


export const getFeeById = async(req,res)=>{


try{


const {id}=req.params


const fee = await prisma.fee.findUnique({

where:{
id:Number(id)
}

})


if(!fee){

return res.status(404).json({
message:"Fee not found"
})

}


res.json(fee)


}
catch(error){

res.status(500).json({
error:error.message
})

}

}





// UPDATE FEE


export const updateFee = async(req,res)=>{


try{


const {id}=req.params


const {
paidAmount
}=req.body



const oldFee =
await prisma.fee.findUnique({

where:{
id:Number(id)
}

})


const pending =
oldFee.totalAmount - paidAmount



const fee =
await prisma.fee.update({

where:{
id:Number(id)
},

data:{

paidAmount,

pendingAmount:pending,

status:

pending===0
?
"PAID"
:
"PARTIAL"

}

})


res.json({

message:"Fee updated",
data:fee

})


}
catch(error){

res.status(500).json({
error:error.message
})

}

}





// DELETE FEE


export const deleteFee = async(req,res)=>{


try{


const {id}=req.params


await prisma.fee.delete({

where:{
id:Number(id)
}

})


res.json({

message:"Fee deleted successfully"

})


}
catch(error){

res.status(500).json({
error:error.message
})

}


}