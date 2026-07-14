import express from "express"


import {

registerTeacher,
getTeachers,
updateTeacher,
deleteTeacher


}
from "../controllers/teacherController.js"


import authMiddleware 
from "../middleware/authMiddleware.js"


import authorize 
from "../middleware/roleMiddleware.js"



const router =
express.Router()



// Admin/Franchise create teacher

router.post(

"/register",

authMiddleware,

authorize(
"ADMIN",
"FRANCHISE"
),

registerTeacher

)





// Teacher profile
router.get(
"/",
authMiddleware,

authorize("ADMIN", "FRANCHISE", "TEACHER"),

getTeachers
)



router.put(
"/:id",
authMiddleware,
authorize("ADMIN", "FRANCHISE"),
updateTeacher
)


router.delete(
"/:id",
authMiddleware,
authorize("ADMIN", "FRANCHISE"),
deleteTeacher
)


export default router