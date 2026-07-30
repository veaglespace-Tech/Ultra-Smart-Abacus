import prisma from "../config/prisma.js";
import CustomError from "../utils/customError.js";

export const feeService = {
  /**
   * Create a new fee record
   */
  createFee: async (data) => {
    const { studentId, franchiseId, batchId, totalFee, paidAmount = 0 } = data;

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

    // Prevent duplicates
    const activeFee = await prisma.fee.findFirst({
      where: { studentId, batchId, isActive: true },
    });
    if (activeFee) {
      throw new CustomError("An active fee record already exists for this student and batch", 400);
    }

    const dueAmount = totalFee - paidAmount;
    const status = dueAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING";

    return await prisma.fee.create({
      data: {
        studentId,
        franchiseId,
        batchId,
        totalFee,
        paidAmount,
        dueAmount,
        status,
        isActive: true,
      },
      include: {
        student: true,
        batch: true,
        franchise: true,
      },
    });
  },

  /**
   * Get filtered fee records
   */
  getFees: async (query) => {
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

    const [fees, totalCount] = await Promise.all([
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
    ]);

    return {
      fees,
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
      where: { id: Number(id), isActive: true },
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
    const { totalFee } = data;

    if (totalFee <= 0) {
      throw new CustomError("Total fee must be greater than 0", 400);
    }

    const existingFee = await prisma.fee.findFirst({
      where: { id: Number(id), isActive: true },
    });

    if (!existingFee) {
      throw new CustomError("Fee record not found", 404);
    }

    if (totalFee < existingFee.paidAmount) {
      throw new CustomError("New total fee cannot be less than already paid amount", 400);
    }

    const dueAmount = totalFee - existingFee.paidAmount;
    const status = dueAmount === 0 ? "PAID" : existingFee.paidAmount > 0 ? "PARTIAL" : "PENDING";

    return await prisma.fee.update({
      where: { id: Number(id) },
      data: {
        totalFee,
        dueAmount,
        status,
      },
      include: {
        student: true,
        batch: true,
        franchise: true,
      },
    });
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
    const fees = await prisma.fee.findMany({
      where: { studentId: Number(studentId), isActive: true },
      include: {
        batch: true,
        franchise: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    const totalFee = fees.reduce((sum, f) => sum + f.totalFee, 0);
    const paidAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const dueAmount = fees.reduce((sum, f) => sum + f.dueAmount, 0);

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
   * Soft-delete/disable fee record
   */
  deleteFee: async (id) => {
    const fee = await prisma.fee.findFirst({
      where: { id: Number(id), isActive: true },
    });

    if (!fee) {
      throw new CustomError("Fee record not found or already deleted", 404);
    }

    return await prisma.fee.update({
      where: { id: fee.id },
      data: { isActive: false },
    });
  },
};
