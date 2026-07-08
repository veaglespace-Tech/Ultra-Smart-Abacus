import jwt from "jsonwebtoken"
import prisma from "../config/prisma.js"


const authMiddleware = async(req,res,next)=>{

try{


const authHeader =
req.headers.authorization


if(!authHeader){

return res.status(401).json({
message:"Token missing"
})

}



const token =
authHeader.split(" ")[1]


const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
)

// Verify that the user actually exists in the database (handles re-seeding / deletions)
const userExists = await prisma.user.findUnique({
  where: { id: decoded.id }
});

if (!userExists) {
  return res.status(401).json({
    message: "User not found or session expired"
  });
}

req.user = decoded


next()


}
catch(error){

res.status(401).json({
message:"Invalid token"
})

}

}


export default authMiddleware