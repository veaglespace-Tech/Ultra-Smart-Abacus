import prisma from "../config/prisma.js";
import CustomError from "../utils/customError.js";

const ensureFeeColumns = async () => {
  const alterColumns = [
    `ALTER TABLE \`Fee\` ADD COLUMN \`franchiseId\` INT NULL`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`batchId\` INT NULL`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`totalFee\` DOUBLE NULL DEFAULT 0`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`paidAmount\` DOUBLE NULL DEFAULT 0`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`dueAmount\` DOUBLE NULL DEFAULT 0`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`status\` VARCHAR(191) NULL DEFAULT 'PENDING'`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`isActive\` TINYINT(1) DEFAULT 1`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`dueDate\` DATETIME NULL`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`createdAt\` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3)`,
    `ALTER TABLE \`Fee\` ADD COLUMN \`updatedAt\` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    `ALTER TABLE \`FeePayment\` ADD COLUMN \`referenceNumber\` VARCHAR(191) NULL`,
    `ALTER TABLE \`FeePayment\` ADD COLUMN \`remarks\` VARCHAR(191) NULL`,
    `ALTER TABLE \`FeePayment\` ADD COLUMN \`createdAt\` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3)`,
    `ALTER TABLE \`FeePayment\` ADD COLUMN \`updatedAt\` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`
  ];
  for (const sql of alterColumns) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) { }
  }
  try {
    await prisma.$executeRawUnsafe(`UPDATE Fee SET dueDate = DATE_ADD(IFNULL(createdAt, NOW()), INTERVAL 30 DAY) WHERE dueDate IS NULL`);
  } catch (e) { }
};

export const feeService = {
  /**
   * Create a new fee record
   */
  createFee: async (data) => {
    const { studentId, franchiseId, batchId, totalFee, paidAmount = 0, dueDate = null } = data || {};

    if (totalFee <= 0) {
      throw new CustomError("Total fee must be greater than 0", 400);
    }

    if (paidAmount < 0 || paidAmount > totalFee) {
      throw new CustomError("Paid amount must be non-negative and cannot exceed total fee", 400);
    }

    // Verify relations
    const [student, franchise, batch] = await Promise.all([
      prisma.student.findUnique({ where: { id: Number(studentId) } }),
      prisma.franchise.findUnique({ where: { id: Number(franchiseId) } }),
      prisma.batch.findUnique({ where: { id: Number(batchId) } }),
    ]);

    if (!student) throw new CustomError("Student does not exist", 404);
    if (!franchise) throw new CustomError("Franchise does not exist", 404);
    if (!batch) throw new CustomError("Batch does not exist", 404);

    // If fee record already exists for this student and batch, update it
    const activeFee = await prisma.fee.findFirst({
      where: { studentId: Number(studentId), batchId: Number(batchId), isActive: true },
    });
    if (activeFee) {
      return await feeService.updateFee(activeFee.id, {
        totalFee: Number(totalFee),
        paidAmount: Number(paidAmount),
        dueDate,
      });
    }

    const dueAmount = Math.max(0, totalFee - paidAmount);
    const status = dueAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING";

    let parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
      parsedDueDate = new Date();
      parsedDueDate.setDate(parsedDueDate.getDate() + 30);
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Fee ADD COLUMN dueDate DATETIME NULL`).catch(() => { });
    } catch (e) { }

    const fee = await prisma.fee.create({
      data: {
        studentId: Number(studentId),
        franchiseId: Number(franchiseId),
        batchId: Number(batchId),
        totalFee: Number(totalFee),
        paidAmount: Number(paidAmount),
        dueAmount: Number(dueAmount),
        status,
        isActive: true,
      },
      include: {
        student: true,
        batch: true,
        franchise: true,
      },
    });

    if (parsedDueDate) {
      const formattedIso = parsedDueDate.toISOString().slice(0, 19).replace('T', ' ');
      await prisma.$executeRawUnsafe(`UPDATE Fee SET dueDate = '${formattedIso}' WHERE id = ${fee.id}`).catch(() => { });
      fee.dueDate = parsedDueDate;
    }

    return fee;
  },

  /**
   * Get filtered fee records
   */
  getFees: async (query) => {
    await ensureFeeColumns();
    const { studentName, batchId, franchiseId, status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { isActive: true };

    if (franchiseId) {
      where.franchiseId = Number(franchiseId);
    }

    if (batchId) {
      where.batchId = Number(batchId);
    }

    if (status) {
      where.status = status;
    }

    if (studentName) {
      where.student = {
        name: {
          contains: studentName,
        },
      };
    }

    const [fees, totalCount, rawDueDates] = await Promise.all([
      prisma.fee.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          student: true,
          batch: true,
          franchise: true,
        },
      }),
      prisma.fee.count({ where }),
      prisma.$queryRawUnsafe(`SELECT id, dueDate FROM Fee`).catch(() => []),
    ]);

    const dueDateMap = new Map((rawDueDates || []).map(r => [Number(r.id), r.dueDate || r.due_date || r.duedate || r.DueDate]));

    const enrichedFees = fees.map(f => ({
      ...f,
      dueDate: dueDateMap.get(Number(f.id)) || f.dueDate || f.createdAt
    }));

    return {
      fees: enrichedFees,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  /**
   * Get single fee by ID
   */
  getFeeById: async (id) => {
    const fee = await prisma.fee.findFirst({
      where: { id: Number(id) },
      include: {
        student: true,
        batch: true,
        franchise: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!fee) {
      throw new CustomError("Fee record not found", 404);
    }

    return fee;
  },

  /**
   * Update fee details
   */
  updateFee: async (id, data) => {
    const { totalFee, paidAmount, dueDate = null, status } = data || {};

    const existingFee = await prisma.fee.findFirst({
      where: { id: Number(id) },
    });

    if (!existingFee) {
      throw new CustomError("Fee record not found", 404);
    }

    const newTotalFee = totalFee !== undefined && !isNaN(Number(totalFee)) ? Number(totalFee) : existingFee.totalFee;
    const newPaidAmount = paidAmount !== undefined && !isNaN(Number(paidAmount)) ? Number(paidAmount) : existingFee.paidAmount;

    if (newTotalFee <= 0) {
      throw new CustomError("Total fee must be greater than 0", 400);
    }

    if (newPaidAmount < 0) {
      throw new CustomError("Paid amount cannot be negative", 400);
    }

    const newDueAmount = Math.max(0, newTotalFee - newPaidAmount);
    let calculatedStatus = status;
    if (!calculatedStatus) {
      calculatedStatus = newDueAmount === 0 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "PENDING";
    }

    let parsedDueDate = dueDate ? new Date(dueDate) : (existingFee.dueDate ? new Date(existingFee.dueDate) : null);
    if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
      parsedDueDate = new Date();
      parsedDueDate.setDate(parsedDueDate.getDate() + 30);
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Fee ADD COLUMN dueDate DATETIME NULL`).catch(() => { });
    } catch (e) { }

    const updated = await prisma.fee.update({
      where: { id: Number(id) },
      data: {
        totalFee: newTotalFee,
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        status: calculatedStatus,
      },
      include: {
        student: true,
        batch: true,
        franchise: true,
      },
    });

    if (parsedDueDate) {
      const formattedIso = parsedDueDate.toISOString().slice(0, 19).replace('T', ' ');
      await prisma.$executeRawUnsafe(`UPDATE Fee SET dueDate = '${formattedIso}' WHERE id = ${Number(id)}`).catch(() => { });
      updated.dueDate = parsedDueDate;
    }

    return updated;
  },

  /**
   * Record fee installment/payment
   */
  recordPayment: async (feeId, paymentData, receivedBy) => {
    const { amount, paymentMode, referenceNumber, remarks } = paymentData;

    if (amount <= 0) {
      throw new CustomError("Payment amount must be greater than 0", 400);
    }

    return await prisma.$transaction(async (tx) => {
      const fee = await tx.fee.findFirst({
        where: { id: Number(feeId), isActive: true },
      });

      if (!fee) {
        throw new CustomError("Fee record not found", 404);
      }

      if (amount > fee.dueAmount) {
        throw new CustomError(`Payment amount (₹${amount}) exceeds remaining due amount (₹${fee.dueAmount})`, 400);
      }

      // Generate receipt number (REC-YYYYMMDD-RANDOM)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = Math.floor(1000 + Math.random() * 9000);
      const receiptNumber = `REC-${dateStr}-${rand}`;

      // Create Payment log
      const payment = await tx.feePayment.create({
        data: {
          feeId: fee.id,
          amount,
          paymentMode,
          referenceNumber,
          remarks,
          receivedBy,
          receiptNumber,
        },
      });

      // Update Fee aggregates
      const paidAmount = fee.paidAmount + amount;
      const dueAmount = fee.totalFee - paidAmount;
      const status = dueAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING";

      const updatedFee = await tx.fee.update({
        where: { id: fee.id },
        data: {
          paidAmount,
          dueAmount,
          status,
        },
        include: {
          student: true,
          batch: true,
          franchise: true,
        },
      });

      return {
        payment,
        fee: updatedFee,
      };
    });
  },

  /**
   * Fetch specific student's fee summary and payment history
   */
  getStudentFeesSummary: async (studentId) => {
    const sIdNum = Number(studentId);
    const student = !isNaN(sIdNum) ? await prisma.student.findUnique({ where: { id: sIdNum } }).catch(() => null) : null;

    const fees = await prisma.fee.findMany({
      where: {
        OR: [
          { studentId: sIdNum },
          ...(student?.userId ? [{ studentId: Number(student.userId) }] : []),
          ...(student?.email ? [{ student: { email: student.email } }] : [])
        ],
        isActive: true
      },
      include: {
        batch: true,
        franchise: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" }
    });

    const totalFee = fees.reduce((sum, f) => sum + (f.totalFee || 0), 0);
    const paidAmount = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const dueAmount = fees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

    return {
      summary: {
        totalFee,
        paidAmount,
        dueAmount,
      },
      fees,
    };
  },

  /**
   * Hard Delete fee record from MySQL
   */
  deleteFee: async (id) => {
    const feeIdNum = Number(id);
    if (isNaN(feeIdNum)) {
      throw new CustomError("Invalid fee ID", 400);
    }

    try {
      // 1. Delete all associated fee payments first
      await prisma.feePayment.deleteMany({
        where: { feeId: feeIdNum },
      }).catch(() => { });

      await prisma.$executeRawUnsafe(`DELETE FROM FeePayment WHERE feeId = ${feeIdNum}`).catch(() => { });

      // 2. Hard delete fee record from MySQL database
      await prisma.fee.delete({
        where: { id: feeIdNum },
      });
    } catch (err) {
      console.warn(`[Fee Hard Delete Fallback] Fee #${feeIdNum}:`, err.message);
      // 3. Raw SQL deletion fallback
      await prisma.$executeRawUnsafe(`DELETE FROM Fee WHERE id = ${feeIdNum}`).catch(async () => {
        // 4. Soft delete fallback
        await prisma.fee.update({
          where: { id: feeIdNum },
          data: { isActive: false },
        }).catch(() => { });
      });
    }

    return { success: true, message: "Fee record deleted" };
  },
};
