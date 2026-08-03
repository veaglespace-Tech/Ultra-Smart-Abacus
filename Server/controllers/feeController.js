import prisma from "../config/prisma.js";
import { feeService } from "../services/feeService.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/customError.js";

// Helper to get student from current user context
const getStudentFromUser = async (user) => {
  let student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student && user.email) {
    student = await prisma.student.findFirst({ where: { email: user.email } });
  }
  return student;
};

// Create a new fee record
export const createFee = asyncHandler(async (req, res) => {
  const { studentId, franchiseId, batchId, totalFee, paidAmount, dueDate } = req.body;
  
  const fee = await feeService.createFee({
    studentId: Number(studentId),
    franchiseId: Number(franchiseId),
    batchId: Number(batchId),
    totalFee: Number(totalFee),
    paidAmount: paidAmount ? Number(paidAmount) : 0,
    dueDate,
  });

  res.status(201).json({
    success: true,
    message: "Fee record created successfully",
    data: fee,
  });
});

// Get all fee records with search and filter
export const getFees = asyncHandler(async (req, res) => {
  console.log(`[AUTH CHECK] User: ${req.user?.id} | Role: ${req.user?.role} | FranchiseID: ${req.user?.franchiseId}`);

  let query = { ...req.query };
  if (req.user && req.user.role === "FRANCHISE") {
    const franchiseId = req.user?.franchiseId ? Number(req.user.franchiseId) : null;
    if (!franchiseId || isNaN(franchiseId)) {
      console.warn(`[SECURITY WARN] Access blocked: User ${req.user?.id} has no valid franchiseId.`);
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    query.franchiseId = franchiseId;
  }

  const result = await feeService.getFees(query);
  res.status(200).json({
    success: true,
    data: result.fees,
    pagination: result.pagination,
  });
});

// Get single fee details by ID
export const getFeeById = asyncHandler(async (req, res) => {
  const fee = await feeService.getFeeById(req.params.id);

  // Access control check for Student role
  if (req.user.role === "STUDENT") {
    const student = await getStudentFromUser(req.user);
    if (!student || student.id !== fee.studentId) {
      throw new CustomError("Access denied. You can only view your own fee records.", 403);
    }
  }

  res.status(200).json({
    success: true,
    data: fee,
  });
});

// Update fee details
export const updateFee = asyncHandler(async (req, res) => {
  const { totalFee, paidAmount, dueDate, status } = req.body;
  const fee = await feeService.updateFee(req.params.id, {
    totalFee,
    paidAmount,
    dueDate,
    status,
  });

  res.status(200).json({
    success: true,
    message: "Fee record updated successfully",
    data: fee,
  });
});

// Collect payment/installment
export const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMode, referenceNumber, remarks } = req.body;

  const result = await feeService.recordPayment(
    req.params.id,
    {
      amount: Number(amount),
      paymentMode,
      referenceNumber,
      remarks,
    },
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: result,
  });
});

// Get logged in student's fee details
export const getMyFees = asyncHandler(async (req, res) => {
  const student = await getStudentFromUser(req.user);
  if (!student) {
    return res.status(200).json({
      success: true,
      data: [],
      summary: { totalFees: 0, totalPaid: 0, totalDue: 0 },
    });
  }

  const result = await feeService.getStudentFeesSummary(student.id);
  res.status(200).json({
    success: true,
    data: result.fees || [],
    summary: result.summary || { totalFees: 0, totalPaid: 0, totalDue: 0 },
  });
});

// Get specific student's fee summary & history
export const getStudentFeesSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Access control check: STUDENT can only view their own
  if (req.user.role === "STUDENT") {
    const student = await getStudentFromUser(req.user);
    if (!student || student.id !== Number(studentId)) {
      throw new CustomError("Access denied. You can only view your own fee records.", 403);
    }
  }

  const result = await feeService.getStudentFeesSummary(studentId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// Delete fee record
export const deleteFee = asyncHandler(async (req, res) => {
  await feeService.deleteFee(req.params.id);
  res.status(200).json({
    success: true,
    message: "Fee record deleted successfully",
  });
});

// Download HTML receipt
export const getFeeReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fee = await feeService.getFeeById(id);

  // Access control
  if (req.user.role === "STUDENT") {
    const student = await getStudentFromUser(req.user);
    if (!student || student.id !== fee.studentId) {
      throw new CustomError("Access denied", 403);
    }
  }

  // if paymentId or txId provided, prefer rendering receipt for that payment
  const { paymentId, txId: qTxId } = req.query || {};
  let payment = fee.payments[0] || {};
  if (paymentId) {
    payment = fee.payments.find(p => p.id === Number(paymentId)) || payment;
  } else if (qTxId) {
    payment = fee.payments.find(p => p.referenceNumber === qTxId || p.receiptNumber === qTxId) || payment;
  }

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt - ${fee.id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-b: 2px solid #edf2f7; padding-bottom: 20px; }
    .logo { font-size: 20px; font-weight: bold; color: #1a202c; }
    .receipt-info { text-align: right; font-size: 13px; color: #4a5568; }
    .details { margin: 25px 0; font-size: 14px; line-height: 1.8; }
    .details strong { color: #2d3748; }
    .totals { background: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
    .footer { text-align: center; font-size: 11px; color: #718096; margin-top: 30px; border-t: 1px solid #edf2f7; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Smart Abacus Academy</div>
      <div style="font-size: 12px; color: #718096; margin-top: 2px;">Receipt & Billing Statement</div>
    </div>
    <div class="receipt-info">
      <div><strong>Receipt #:</strong> ${payment.receiptNumber || 'N/A'}</div>
      <div><strong>Date:</strong> ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}</div>
    </div>
  </div>
  
  <div class="details">
    <div><strong>Student Name:</strong> ${fee.student?.name || 'N/A'}</div>
    <div><strong>Student Email:</strong> ${fee.student?.email || 'N/A'}</div>
    <div><strong>Batch Code:</strong> ${fee.batch?.code || 'N/A'} (${fee.batch?.name || 'N/A'})</div>
    <div><strong>Payment Mode:</strong> ${payment.paymentMode || 'N/A'}</div>
    <div><strong>Reference/Txn ID:</strong> ${payment.referenceNumber || 'N/A'}</div>
    <div><strong>Remarks:</strong> ${payment.remarks || '—'}</div>
  </div>

  <div class="totals">
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Total Billing Fee:</span>
      <span style="font-weight: bold;">₹${fee.totalFee.toLocaleString('en-IN')}.00</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #2f855a;">
      <span>Total Paid:</span>
      <span style="font-weight: bold;">₹${fee.paidAmount.toLocaleString('en-IN')}.00</span>
    </div>
    <div style="display: flex; justify-content: space-between; border-t: 1px solid #cbd5e0; pt-2; font-size: 16px; color: #c53030;">
      <span>Due Balance:</span>
      <span style="font-weight: bold;">₹${fee.dueAmount.toLocaleString('en-IN')}.00</span>
    </div>
  </div>

  <div class="footer">
    Thank you for your payment! This is a system-generated statement.
  </div>
</body>
</html>`;

  res.setHeader("Content-Disposition", `attachment; filename=FeeReceipt_${fee.id}.html`);
  res.setHeader("Content-Type", "text/html");
  return res.send(html);
});

// Temp / mock fee creators
export const createDemoFee = asyncHandler(async (req, res) => {
  const student = await getStudentFromUser(req.user);
  if (!student) {
    throw new CustomError("Student record not found for current user", 404);
  }

  // Find a franchise and batch to associate
  const batch = await prisma.batch.findFirst() || { id: 1 };
  const franchise = await prisma.franchise.findFirst() || { id: 1 };

  const totalFee = Number(req.body.totalAmount) || 500;

  const demo = await feeService.createFee({
    studentId: student.id,
    franchiseId: franchise.id,
    batchId: batch.id,
    totalFee,
    paidAmount: totalFee,
  });

  res.status(201).json({ success: true, data: demo });
});
