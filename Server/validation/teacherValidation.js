import { body } from "express-validator"


export const teacherRegisterValidation = [

body("name")
.notEmpty()
.withMessage("Name required"),


body("email")
.isEmail()
.withMessage("Invalid email"),


body("password")
.isLength({min:6})
.withMessage("Password minimum 6 chars"),


body("qualification")
.notEmpty(),


body("experience")
.isNumeric(),

body("specialization")
.notEmpty()
.withMessage("Specialization required"),    

body("phone")
.isMobilePhone()
.withMessage("Invalid phone number")



]