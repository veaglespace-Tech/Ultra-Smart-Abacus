import express from "express"


import {

createInventory,
getInventories,
getInventoryById,
updateInventory,
deleteInventory

}
from "../controllers/inventoryController.js"



import authMiddleware from "../middleware/authMiddleware.js"

import authorize from "../middleware/roleMiddleware.js"



const router = express.Router()



router.post(
"/",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
createInventory
)



router.get(
"/",
authMiddleware,
authorize("ADMIN","FRANCHISE","TEACHER","STUDENT"),
getInventories
)



router.get(
"/:id",
authMiddleware,
authorize("ADMIN","FRANCHISE","TEACHER","STUDENT"),
getInventoryById
)



router.put(
"/:id",
authMiddleware,
authorize("ADMIN","FRANCHISE"),
updateInventory
)



router.delete(
"/:id",
authMiddleware,
authorize("ADMIN", "FRANCHISE"),
deleteInventory
)



export default router