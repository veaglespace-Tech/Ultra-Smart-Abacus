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

req.user = {
  ...decoded,
  id: userExists.id,
  email: userExists.email,
  name: userExists.name,
  role: userExists.role
};

if (req.user.role === "FRANCHISE") {
  let franchise = await prisma.franchise.findFirst({
    where: {
      OR: [
        { userId: Number(req.user.id) },
        { email: req.user.email }
      ]
    }
  });

  if (!franchise && req.user.email) {
    franchise = await prisma.franchise.create({
      data: {
        name: req.user.name || "Franchise Center",
        email: req.user.email,
        phone: "",
        address: "",
        userId: Number(req.user.id)
      }
    }).catch(() => null);
  }

  if (franchise) {
    req.user.franchiseId = franchise.id;
    if (!franchise.userId) {
      await prisma.franchise.update({ where: { id: franchise.id }, data: { userId: Number(req.user.id) } }).catch(() => {});
    }
  } else {
    req.user.franchiseId = decoded.franchiseId || null;
  }
}

console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);
next();


}
catch(error){

res.status(401).json({
message:"Invalid token"
})

}

}


export default authMiddleware