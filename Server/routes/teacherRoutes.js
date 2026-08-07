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



router.post(
  "/register",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  registerTeacher
);





// Teacher list / profile
router.get(
"/",
authMiddleware,

authorize("ADMIN", "FRANCHISE", "TEACHER", "STUDENT"),

getTeachers
)



router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE", "TEACHER"),
  updateTeacher
);


router.delete(
"/:id",
authMiddleware,
authorize("ADMIN", "FRANCHISE"),
deleteTeacher
)


export default router