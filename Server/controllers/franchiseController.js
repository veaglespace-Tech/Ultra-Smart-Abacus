import prisma from "../config/prisma.js"

import bcrypt from "bcrypt"


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



        // create franchise + user
        const franchise =
            await prisma.franchise.create({

                data: {

                    name,

                    email,

                    phone,

                    address,


                    user: {

                        create: {

                            fullName: name,

                            email,

                            password: hashPassword,

                            role: "FRANCHISE",

                            phone,

                            city: "",

                            address,

                            gender: "MALE"

                        }

                    }


                }

            })



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


        const franchise =
            await prisma.franchise.findFirst({

                where: {

                    userId: req.user.id

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


            })



        if (!franchise) {

            return res.status(404).json({

                message: "Franchise not found"

            })

        }



        res.json({

            success: true,

            franchise

        })


    }
    catch (error) {

        next(error)

    }

}






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

                            role: true

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
id
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



const franchise =
await prisma.franchise.findUnique({

where:{
id
}

})


if(!franchise){

return res.status(404).json({

message:"Franchise not found"

})

}



// first delete franchise
await prisma.franchise.delete({

where:{
id
}

})



// then delete user
await prisma.user.delete({

where:{
id:franchise.userId
}

})



res.json({

success:true,

message:"Franchise deleted successfully"

})


}
catch(error){

next(error)

}

}