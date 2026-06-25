import prisma from "../config/prisma.js"

import bcrypt from "bcrypt"



export const registerTeacher =
async(req,res,next)=>{


try{


const {

name,
email,
password,
qualification,
experience


}=req.body



const existing =
await prisma.user.findUnique({

where:{
email
}

})


if(existing){

return res.status(400).json({

message:"Email already exists"

})

}



const hashPassword =
await bcrypt.hash(password,10)



const teacher =
await prisma.teacher.create({


data:{

name,

qualification,

experience,


user:{


create:{


name,

email,

password:hashPassword,

role:"TEACHER"


}


}


}


})



res.status(201).json({

success:true,

message:"Teacher registered",

teacher

})


}

catch(error){

next(error)

}


}






export const getTeachers = async(req,res,next)=>{

try{


const teachers =
await prisma.teacher.findMany({

include:{

user:{

select:{

id:true,
name:true,
email:true,
role:true

}

}

}

})



res.json({

success:true,

count:teachers.length,

teachers

})


}
catch(error){

next(error)

}

}

export const updateTeacher = async(req,res,next)=>{

try{


const { id } = req.params


const {
name,
qualification,
experience
}
= req.body



const teacher =
await prisma.teacher.update({

where:{
id
},


data:{

name,

qualification,

experience

}

})



res.json({

success:true,

message:"Teacher updated successfully",

teacher

})


}
catch(error){

next(error)

}

}

export const deleteTeacher = async(req,res,next)=>{

try{


const { id } = req.params



const teacher =
await prisma.teacher.findUnique({

where:{
id
}

})


if(!teacher){

return res.status(404).json({

message:"Teacher not found"

})

}



// first delete teacher
await prisma.teacher.delete({

where:{
id
}

})



// delete related user
await prisma.user.delete({

where:{
id:teacher.userId
}

})



res.json({

success:true,

message:"Teacher deleted successfully"

})


}
catch(error){

next(error)

}

}