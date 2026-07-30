import prisma from "../config/prisma.js";

// Helper to ensure MySQL columns exist
async function ensureInventorySchema() {
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN category VARCHAR(255) DEFAULT 'General'`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN sku VARCHAR(255) NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN minimumStock INT DEFAULT 10`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN unitPrice DOUBLE DEFAULT 0`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE'`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN createdBy INT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE Inventory ADD COLUMN franchiseId INT NULL`).catch(() => {});
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS InventoryTransfer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      inventoryId INT NOT NULL,
      franchiseId INT NOT NULL,
      quantity INT NOT NULL,
      remarks VARCHAR(255) NULL,
      transferredBy INT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
}

// 1. Create Inventory (ADMIN & FRANCHISE)
export const createInventory = async (req, res, next) => {
  try {
    await ensureInventorySchema();

    const {
      itemName,
      category = "General",
      sku,
      description,
      quantity = 0,
      minimumStock = 10,
      unitPrice = 0,
      price = 0,
      status = "ACTIVE",
      franchiseId
    } = req.body;

    if (!itemName) {
      return res.status(400).json({ success: false, error: "Item name is required" });
    }

    const priceVal = Number(req.body.price ?? req.body.unitPrice ?? unitPrice ?? 0);
    const qtyVal = Number(quantity || 0);
    const minVal = Number(minimumStock || 10);
    const createdBy = req.user?.id || null;
    const targetFranchiseId = req.user?.role === "FRANCHISE" ? req.user.franchiseId : (franchiseId ? Number(franchiseId) : null);

    const escName = itemName.trim().replace(/'/g, "''");
    const escCategory = category.replace(/'/g, "''");
    const escStatus = status.replace(/'/g, "''");

    // Scope check: Check if item with same SKU or Name exists in target scope
    let scopeWhere = targetFranchiseId ? `i.franchiseId = ${targetFranchiseId}` : `i.franchiseId IS NULL`;
    let matchConditions = [`LOWER(TRIM(i.itemName)) = LOWER('${escName}')`];
    if (sku && sku.trim()) {
      const escSkuParam = sku.trim().replace(/'/g, "''");
      matchConditions.push(`i.sku = '${escSkuParam}'`);
    }

    const existingQuery = `SELECT i.* FROM Inventory i WHERE ${scopeWhere} AND (${matchConditions.join(" OR ")})`;
    const existingRows = await prisma.$queryRawUnsafe(existingQuery).catch(() => []);

    if (existingRows && existingRows.length > 0) {
      // Existing item found in scope: Update stock quantity instead of creating duplicate row
      const existing = existingRows[0];
      const newQty = Number(existing.quantity || 0) + qtyVal;
      const updatedPrice = priceVal > 0 ? priceVal : Number(existing.price || existing.unitPrice || 0);

      await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          price: updatedPrice
        }
      });

      const setClauses = [
        `category = '${escCategory}'`,
        `minimumStock = ${minVal}`,
        `unitPrice = ${updatedPrice}`,
        `status = '${escStatus}'`
      ];
      if (sku && sku.trim()) {
        setClauses.push(`sku = '${sku.trim().replace(/'/g, "''")}'`);
      }
      if (description) {
        setClauses.push(`description = '${description.replace(/'/g, "''")}'`);
      }

      await prisma.$executeRawUnsafe(`UPDATE Inventory SET ${setClauses.join(', ')} WHERE id = ${existing.id}`).catch(() => {});

      const resultItem = {
        ...existing,
        itemName: existing.itemName,
        description: description || existing.description,
        quantity: newQty,
        price: updatedPrice,
        unitPrice: updatedPrice,
        category,
        sku: sku ? sku.trim() : (existing.sku || `SKU-${existing.id}`),
        minimumStock: minVal,
        status,
        franchiseId: targetFranchiseId
      };

      return res.status(200).json({
        success: true,
        message: `Updated stock quantity for existing item '${existing.itemName}' (+${qtyVal} units, Total: ${newQty})`,
        inventory: resultItem
      });
    }

    // New item creation if not found in scope
    const itemSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const escSku = itemSku.replace(/'/g, "''");

    const inventory = await prisma.inventory.create({
      data: {
        itemName: itemName.trim(),
        description: description || null,
        quantity: qtyVal,
        price: priceVal
      }
    });

    const sql = `
      UPDATE Inventory 
      SET category = '${escCategory}', 
          sku = '${escSku}', 
          minimumStock = ${minVal}, 
          unitPrice = ${priceVal}, 
          status = '${escStatus}', 
          createdBy = ${createdBy ? createdBy : 'NULL'}, 
          franchiseId = ${targetFranchiseId ? targetFranchiseId : 'NULL'} 
      WHERE id = ${inventory.id}
    `;
    await prisma.$executeRawUnsafe(sql).catch(err => console.warn("Raw SQL update warn:", err.message));

    const resultItem = {
      ...inventory,
      category,
      sku: itemSku,
      minimumStock: minVal,
      unitPrice: priceVal,
      status,
      createdBy,
      franchiseId: targetFranchiseId
    };

    // Low stock notification if applicable
    if (resultItem.quantity <= resultItem.minimumStock) {
      await prisma.notification.create({
        data: {
          title: `Low Stock Alert: ${resultItem.itemName}`,
          message: `Stock level for ${resultItem.itemName} (${resultItem.quantity} units) is at or below minimum threshold (${resultItem.minimumStock}).`,
          type: "ANNOUNCEMENT",
          recipientType: "ALL",
          createdBy: req.user?.id || 1
        }
      }).catch(err => console.warn("Failed sending notification:", err.message));
    }

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      inventory: resultItem
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Inventories
export const getInventories = async (req, res, next) => {
  try {
    await ensureInventorySchema();

    let query = `SELECT i.*, f.name as franchiseName FROM Inventory i LEFT JOIN Franchise f ON i.franchiseId = f.id`;
    let conditions = [];

    if (req.user && req.user.role === "FRANCHISE") {
      const fId = req.user.franchiseId ? Number(req.user.franchiseId) : null;
      if (!fId) {
        return res.json({ success: true, count: 0, inventories: [] });
      }
      conditions.push(`i.franchiseId = ${fId}`);
    } else if (req.query.franchiseId) {
      conditions.push(`i.franchiseId = ${Number(req.query.franchiseId)}`);
    }

    if (req.query.status && req.query.status !== "All") {
      conditions.push(`i.status = '${req.query.status.replace(/'/g, "''")}'`);
    }

    if (req.query.category && req.query.category !== "All") {
      conditions.push(`i.category = '${req.query.category.replace(/'/g, "''")}'`);
    }

    if (req.query.search) {
      const s = req.query.search.replace(/'/g, "''");
      conditions.push(`(i.itemName LIKE '%${s}%' OR i.sku LIKE '%${s}%' OR i.category LIKE '%${s}%' OR i.description LIKE '%${s}%')`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY i.createdAt DESC`;

    const rawRows = await prisma.$queryRawUnsafe(query).catch(err => {
      console.warn("getInventories Raw query error:", err?.message);
      return [];
    });

    const inventories = (rawRows || []).map(row => ({
      id: row.id,
      itemName: row.itemName,
      description: row.description,
      quantity: Number(row.quantity || 0),
      price: Number(row.price || row.unitPrice || 0),
      unitPrice: Number(row.unitPrice || row.price || 0),
      minimumStock: Number(row.minimumStock ?? 10),
      category: row.category || "General",
      sku: row.sku || `SKU-${row.id}`,
      status: row.status || "ACTIVE",
      createdBy: row.createdBy,
      franchiseId: row.franchiseId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      franchise: row.franchiseName ? { id: row.franchiseId, name: row.franchiseName } : null
    }));

    return res.json({
      success: true,
      count: inventories.length,
      inventories
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Inventory By ID
export const getInventoryById = async (req, res, next) => {
  try {
    await ensureInventorySchema();
    const { id } = req.params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return res.status(400).json({ success: false, error: "Invalid inventory ID parameter" });
    }

    const rows = await prisma.$queryRawUnsafe(
      `SELECT i.*, f.name as franchiseName FROM Inventory i LEFT JOIN Franchise f ON i.franchiseId = f.id WHERE i.id = ${numId}`
    ).catch(() => []);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: "Inventory item not found" });
    }

    const row = rows[0];
    const inventory = {
      id: row.id,
      itemName: row.itemName,
      description: row.description,
      quantity: Number(row.quantity || 0),
      price: Number(row.price || row.unitPrice || 0),
      unitPrice: Number(row.unitPrice || row.price || 0),
      minimumStock: Number(row.minimumStock ?? 10),
      category: row.category || "General",
      sku: row.sku || `SKU-${row.id}`,
      status: row.status || "ACTIVE",
      createdBy: row.createdBy,
      franchiseId: row.franchiseId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      franchise: row.franchiseName ? { id: row.franchiseId, name: row.franchiseName } : null
    };

    if (req.user?.role === "FRANCHISE" && inventory.franchiseId !== req.user.franchiseId) {
      return res.status(403).json({ success: false, error: "Unauthorized access to franchise inventory" });
    }

    return res.json({ success: true, inventory });
  } catch (error) {
    next(error);
  }
};

// 4. Update Inventory (ADMIN & FRANCHISE)
export const updateInventory = async (req, res, next) => {
  try {
    await ensureInventorySchema();
    const { id } = req.params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return res.status(400).json({ success: false, error: "Invalid inventory ID parameter" });
    }

    const {
      itemName,
      category,
      sku,
      description,
      quantity,
      minimumStock,
      unitPrice,
      status,
      franchiseId
    } = req.body;

    const baseData = {};
    if (itemName !== undefined) baseData.itemName = itemName;
    if (description !== undefined) baseData.description = description;
    if (quantity !== undefined) baseData.quantity = Number(quantity);
    if (unitPrice !== undefined || req.body.price !== undefined) {
      baseData.price = Number(req.body.price ?? unitPrice ?? 0);
    }

    const updatedBase = await prisma.inventory.update({
      where: { id: numId },
      data: baseData
    });

    const setClauses = [];
    if (category !== undefined) setClauses.push(`category = '${category.replace(/'/g, "''")}'`);
    if (sku !== undefined) setClauses.push(`sku = '${sku.replace(/'/g, "''")}'`);
    if (minimumStock !== undefined) setClauses.push(`minimumStock = ${Number(minimumStock)}`);
    if (unitPrice !== undefined) setClauses.push(`unitPrice = ${Number(unitPrice)}`);
    if (status !== undefined) setClauses.push(`status = '${status.replace(/'/g, "''")}'`);
    if (franchiseId !== undefined) {
      setClauses.push(`franchiseId = ${franchiseId ? Number(franchiseId) : 'NULL'}`);
    }

    if (setClauses.length > 0) {
      await prisma.$executeRawUnsafe(`UPDATE Inventory SET ${setClauses.join(', ')} WHERE id = ${numId}`).catch(() => {});
    }

    return res.json({
      success: true,
      message: "Inventory updated successfully",
      inventory: { ...updatedBase, category, sku, minimumStock, unitPrice, status }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Inventory (ADMIN)
export const deleteInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    if (isNaN(numId)) {
      return res.status(400).json({ success: false, error: "Invalid inventory ID parameter" });
    }

    await prisma.inventory.delete({ where: { id: numId } });

    return res.json({
      success: true,
      message: "Inventory item deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// 6. Stock Distribution (ADMIN to FRANCHISE)
export const distributeInventory = async (req, res, next) => {
  try {
    await ensureInventorySchema();
    const { inventoryId, franchiseId, quantity, remarks } = req.body;

    const qtyToTransfer = Number(quantity);
    const targetFranchiseId = Number(franchiseId);
    const sourceInventoryId = Number(inventoryId);

    if (!sourceInventoryId || !targetFranchiseId || !qtyToTransfer || qtyToTransfer <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid inventoryId, franchiseId, and positive quantity are required"
      });
    }

    const sourceRows = await prisma.$queryRawUnsafe(`SELECT * FROM Inventory WHERE id = ${sourceInventoryId}`).catch(() => []);
    if (!sourceRows || sourceRows.length === 0) {
      return res.status(404).json({ success: false, error: "Source inventory item not found" });
    }

    const sourceItem = sourceRows[0];
    if (Number(sourceItem.quantity) < qtyToTransfer) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${sourceItem.quantity}, Requested: ${qtyToTransfer}`
      });
    }

    const targetFranchise = await prisma.franchise.findUnique({
      where: { id: targetFranchiseId }
    });

    if (!targetFranchise) {
      return res.status(404).json({ success: false, error: "Target franchise not found" });
    }

    // Decrement Admin source stock
    await prisma.inventory.update({
      where: { id: sourceInventoryId },
      data: { quantity: { decrement: qtyToTransfer } }
    });

    // Check if target franchise already has this item
    const skuEsc = (sourceItem.sku || '').replace(/'/g, "''");
    const nameEsc = (sourceItem.itemName || '').trim().replace(/'/g, "''");
    const targetSku = `${sourceItem.sku || 'SKU'}-F${targetFranchiseId}`;
    const targetSkuEsc = targetSku.replace(/'/g, "''");

    const existingTarget = await prisma.$queryRawUnsafe(
      `SELECT * FROM Inventory WHERE franchiseId = ${targetFranchiseId} AND (
        sku = '${skuEsc}' OR 
        sku = '${targetSkuEsc}' OR 
        LOWER(TRIM(itemName)) = LOWER('${nameEsc}')
      )`
    ).catch(() => []);

    let targetItemId;
    if (existingTarget && existingTarget.length > 0) {
      targetItemId = existingTarget[0].id;
      await prisma.inventory.update({
        where: { id: targetItemId },
        data: { quantity: { increment: qtyToTransfer } }
      });
    } else {
      const createdTarget = await prisma.inventory.create({
        data: {
          itemName: sourceItem.itemName,
          description: sourceItem.description,
          quantity: qtyToTransfer,
          price: Number(sourceItem.unitPrice || sourceItem.price || 0)
        }
      });
      targetItemId = createdTarget.id;
      await prisma.$executeRawUnsafe(`
        UPDATE Inventory 
        SET category = '${(sourceItem.category || 'General').replace(/'/g, "''")}', 
            sku = '${targetSkuEsc}', 
            minimumStock = ${Number(sourceItem.minimumStock || 10)}, 
            unitPrice = ${Number(sourceItem.unitPrice || sourceItem.price || 0)}, 
            status = 'ACTIVE', 
            createdBy = ${req.user?.id || 1}, 
            franchiseId = ${targetFranchiseId} 
        WHERE id = ${targetItemId}
      `).catch(() => {});
    }

    // Create Audit Record
    const escRemarks = (remarks || `Stock transferred to ${targetFranchise.name}`).replace(/'/g, "''");
    await prisma.$executeRawUnsafe(`
      INSERT INTO InventoryTransfer (inventoryId, franchiseId, quantity, remarks, transferredBy)
      VALUES (${sourceInventoryId}, ${targetFranchiseId}, ${qtyToTransfer}, '${escRemarks}', ${req.user?.id || 1})
    `).catch(err => console.warn("Failed inserting transfer record:", err.message));

    // Send Notification
    await prisma.notification.create({
      data: {
        title: "New Inventory Stock Received",
        message: `Your franchise received ${qtyToTransfer} units of '${sourceItem.itemName}' from Central Admin.`,
        type: "ANNOUNCEMENT",
        recipientType: "FRANCHISES",
        createdBy: req.user?.id || 1
      }
    }).catch(err => console.warn("Notification error:", err.message));

    return res.json({
      success: true,
      message: `Successfully transferred ${qtyToTransfer} units of '${sourceItem.itemName}' to ${targetFranchise.name}`
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get Low Stock Items (ADMIN & FRANCHISE)
export const getLowStock = async (req, res, next) => {
  try {
    await ensureInventorySchema();
    let whereClause = "";
    if (req.user && req.user.role === "FRANCHISE") {
      const fId = req.user.franchiseId ? Number(req.user.franchiseId) : null;
      if (fId) {
        whereClause = ` WHERE i.franchiseId = ${fId}`;
      }
    }

    const rawRows = await prisma.$queryRawUnsafe(
      `SELECT i.*, f.name as franchiseName FROM Inventory i LEFT JOIN Franchise f ON i.franchiseId = f.id ${whereClause} ORDER BY i.quantity ASC`
    ).catch(() => []);

    const inventories = (rawRows || []).map(row => ({
      id: row.id,
      itemName: row.itemName,
      description: row.description,
      quantity: Number(row.quantity || 0),
      price: Number(row.price || row.unitPrice || 0),
      unitPrice: Number(row.unitPrice || row.price || 0),
      minimumStock: Number(row.minimumStock ?? 10),
      category: row.category || "General",
      sku: row.sku || `SKU-${row.id}`,
      status: row.status || "ACTIVE",
      createdBy: row.createdBy,
      franchiseId: row.franchiseId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      franchise: row.franchiseName ? { id: row.franchiseId, name: row.franchiseName } : null
    })).filter(item => Number(item.quantity || 0) <= Number(item.minimumStock || 10));

    return res.json({
      success: true,
      count: inventories.length,
      inventories
    });
  } catch (error) {
    next(error);
  }
};

// 8. Get Transfer Audit History (ADMIN & FRANCHISE)
export const getTransferHistory = async (req, res, next) => {
  try {
    await ensureInventorySchema();
    let query = `
      SELECT t.*, i.itemName, i.category, i.sku, f.name as franchiseName, u.name as userName, u.email as userEmail 
      FROM InventoryTransfer t
      LEFT JOIN Inventory i ON t.inventoryId = i.id
      LEFT JOIN Franchise f ON t.franchiseId = f.id
      LEFT JOIN User u ON t.transferredBy = u.id
    `;

    if (req.user && req.user.role === "FRANCHISE") {
      const fId = req.user.franchiseId ? Number(req.user.franchiseId) : null;
      if (!fId) {
        return res.json({ success: true, count: 0, history: [] });
      }
      query += ` WHERE t.franchiseId = ${fId}`;
    }

    query += ` ORDER BY t.createdAt DESC`;

    const rawRows = await prisma.$queryRawUnsafe(query).catch(() => []);

    const history = (rawRows || []).map(r => ({
      id: r.id,
      inventoryId: r.inventoryId,
      franchiseId: r.franchiseId,
      quantity: r.quantity,
      remarks: r.remarks,
      transferredBy: r.transferredBy,
      createdAt: r.createdAt,
      inventory: { id: r.inventoryId, itemName: r.itemName || "Item", category: r.category || "General", sku: r.sku || "N/A" },
      franchise: { id: r.franchiseId, name: r.franchiseName || "Franchise" },
      user: { id: r.transferredBy, name: r.userName || "Admin", email: r.userEmail || "" }
    }));

    return res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};