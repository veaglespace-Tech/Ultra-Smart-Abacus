import express from "express"


import {

createFee,
getFees,
getFeeById,
updateFee,
deleteFee,
getMyFees,
getFeeReceipt

} from "../controllers/feeController.js"



import authMiddleware from "../middleware/authMiddleware.js"

import authorize from "../middleware/roleMiddleware.js"

import feeValidation from "../validation/feeValidation.js"

import validationMiddleware 
from "../middleware/validation.middleware.js"



const router=express.Router()



// CREATE

router.post(
"/",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
feeValidation,
validationMiddleware,
createFee
)



// READ ALL

router.get(
"/",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
getFees
)


// STUDENT: get own fees
router.get(
	"/me",
	authMiddleware,
	authorize("STUDENT"),
	getMyFees
)



// READ ONE

router.get(
"/:id",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
getFeeById
)

// fee receipt download (student or admin/franchise)
router.get(
	"/:id/receipt",
	authMiddleware,
	getFeeReceipt
)



// UPDATE

router.put(
"/:id",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
updateFee
)



// DELETE

router.delete(
"/:id",
authMiddleware,
authorize("ADMIN"),
deleteFee
)



export default router