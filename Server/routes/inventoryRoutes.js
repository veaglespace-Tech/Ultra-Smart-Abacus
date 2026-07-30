import express from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  distributeInventory,
  getLowStock,
  getTransferHistory
} from "../controllers/inventoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Specific routes MUST be defined before parametric /:id routes
router.get(
  "/low-stock",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  getLowStock
);

router.get(
  "/history",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  getTransferHistory
);

router.patch(
  "/distribute",
  authMiddleware,
  authorize("ADMIN"),
  distributeInventory
);

// Standard CRUD routes
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  createInventory
);

router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  getInventories
);

router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  getInventoryById
);

router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "FRANCHISE"),
  updateInventory
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteInventory
);

export default router;