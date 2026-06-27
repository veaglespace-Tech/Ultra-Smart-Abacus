import { body } from "express-validator"


const feeValidation = [

body("studentId")
.notEmpty()
.withMessage("Student id required"),


body("totalAmount")
.isNumeric()
.withMessage("Amount must be number"),


body("paidAmount")
.optional()
.isNumeric()
.withMessage("Paid amount must be number")

]


export default feeValidation