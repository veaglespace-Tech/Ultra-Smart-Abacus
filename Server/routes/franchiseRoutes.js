import express from "express"

import {

registerFranchise,
getFranchiseProfile,
getFranchises,
updateFranchise,
deleteFranchise

}
from "../controllers/franchiseController.js"

import authMiddleware from "../middleware/authMiddleware.js"

import authorize from "../middleware/roleMiddleware.js"


const router = express.Router()


router.post(
    "/register",
    authMiddleware,
    authorize("ADMIN"),
    registerFranchise
)


router.get(
    "/profile",
    authMiddleware,
    authorize("FRANCHISE"),
    getFranchiseProfile
)


router.get(
    "/",
    authMiddleware,
    authorize("ADMIN"),
    getFranchises
)

router.put(

"/:id",
authMiddleware,
authorize("ADMIN"),
updateFranchise
)

router.delete(

"/:id",
authMiddleware,
authorize("ADMIN"),
deleteFranchise

)

export default router