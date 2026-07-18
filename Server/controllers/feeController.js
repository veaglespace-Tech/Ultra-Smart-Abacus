<<<<<<< HEAD
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
=======
import prisma from "../config/prisma.js"


// CREATE FEE
export const createFee = async(req,res)=>{

try{

const {
studentId,
totalAmount,
paidAmount
}=req.body


const paid = paidAmount || 0

const pending = totalAmount - paid


const fee = await prisma.fee.create({

data:{

studentId,

totalAmount,

paidAmount:paid,

pendingAmount:pending,

status:
pending === 0
? "PAID"
:
paid > 0
? "PARTIAL"
:
"PENDING"

}

})


res.status(201).json({
message:"Fee created successfully",
data:fee
})


}
catch(error){

res.status(500).json({
error:error.message
})

}

}



// GET ALL FEES

export const getFees = async(req,res)=>{

try{


const fees = await prisma.fee.findMany()


res.json(fees)


}
catch(error){

res.status(500).json({
error:error.message
})

}

}




// GET SINGLE FEE


export const getFeeById = async(req,res)=>{


try{


const {id}=req.params


const fee = await prisma.fee.findUnique({

where:{
id:Number(id)
}

})


if(!fee){

return res.status(404).json({
message:"Fee not found"
})

}


res.json(fee)


}
catch(error){

res.status(500).json({
error:error.message
})

}

}





// UPDATE FEE


export const updateFee = async(req,res)=>{


try{


const {id}=req.params


const {
paidAmount
}=req.body



const oldFee =
await prisma.fee.findUnique({

where:{
id:Number(id)
}

})


const pending =
oldFee.totalAmount - paidAmount



const fee =
await prisma.fee.update({

where:{
id:Number(id)
},

data:{

paidAmount,

pendingAmount:pending,

status:

pending===0
?
"PAID"
:
"PARTIAL"

}

})


res.json({

message:"Fee updated",
data:fee

})


}
catch(error){

res.status(500).json({
error:error.message
})

}

}





// DELETE FEE


export const deleteFee = async(req,res)=>{


try{


const {id}=req.params


await prisma.fee.delete({

where:{
id:Number(id)
}

})


res.json({

message:"Fee deleted successfully"

})


}
catch(error){

res.status(500).json({
error:error.message
})

}


}

// GET MY FEES (Student view) - optional status filter
export const getMyFees = async (req, res) => {
	try {
		// find student by logged in user
		let student = await prisma.student.findUnique({ where: { userId: req.user.id } });

		// Fallback: if student record isn't linked by userId, try matching by email
		if (!student && req.user && req.user.email) {
			student = await prisma.student.findFirst({ where: { email: req.user.email } });
		}

		if (!student) {
			console.debug(`getMyFees: no student record found for user id=${req.user?.id} email=${req.user?.email}`);
			return res.status(200).json({ success: true, data: [] });
		}

		const { status } = req.query;

		const where = { studentId: student.id };
		if (status) where.status = status;

		const fees = await prisma.fee.findMany({
			where,
			orderBy: [{ createdAt: 'desc' }],
			include: { payments: true }
		});

		console.debug(`getMyFees: returning ${fees.length} fees for studentId=${student.id}`);

		return res.status(200).json({ success: true, data: fees });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
>>>>>>> b45c6b08f2c3412a020dae9668c3190529c2c059
};

// Create a new fee record
export const createFee = asyncHandler(async (req, res) => {
  const { studentId, franchiseId, batchId, totalFee, paidAmount } = req.body;
  
  const fee = await feeService.createFee({
    studentId: Number(studentId),
    franchiseId: Number(franchiseId),
    batchId: Number(batchId),
    totalFee: Number(totalFee),
    paidAmount: paidAmount ? Number(paidAmount) : 0,
  });

<<<<<<< HEAD
  res.status(201).json({
    success: true,
    message: "Fee record created successfully",
    data: fee,
  });
});
=======
		const fee = await prisma.fee.findUnique({
			where: { id: Number(id) },
			include: {
				student: true,
				payments: true
			}
		});
>>>>>>> b45c6b08f2c3412a020dae9668c3190529c2c059

// Get all fee records with search and filter
export const getFees = asyncHandler(async (req, res) => {
  const result = await feeService.getFees(req.query);
  res.status(200).json({
    success: true,
    data: result.fees,
    pagination: result.pagination,
  });
});

// Get single fee details by ID
export const getFeeById = asyncHandler(async (req, res) => {
  const fee = await feeService.getFeeById(req.params.id);

<<<<<<< HEAD
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

// Update total fee
export const updateFee = asyncHandler(async (req, res) => {
  const fee = await feeService.updateFee(req.params.id, {
    totalFee: Number(req.body.totalFee),
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
    throw new CustomError("Student profile not found", 404);
  }

  const result = await feeService.getStudentFeesSummary(student.id);
  res.status(200).json({
    success: true,
    data: result.fees,
    summary: result.summary,
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

  const latestPayment = fee.payments[0] || {};
  const html = `<!doctype html>
=======
	 	// if paymentId or txId provided, prefer rendering receipt for that payment
	 	const { paymentId, txId: qTxId } = req.query || {};

		let payment = null;
		if (paymentId) {
			payment = await prisma.feePayment.findUnique({ where: { id: Number(paymentId) } });
		} else if (qTxId) {
			payment = await prisma.feePayment.findFirst({ where: { txId: qTxId } });
		}

		const html = `<!doctype html>
>>>>>>> b45c6b08f2c3412a020dae9668c3190529c2c059
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
<<<<<<< HEAD
  <div class="header">
    <div>
      <div class="logo">Smart Abacus Academy</div>
      <div style="font-size: 12px; color: #718096; margin-top: 2px;">Receipt & Billing Statement</div>
    </div>
    <div class="receipt-info">
      <div><strong>Receipt #:</strong> ${latestPayment.receiptNumber || 'N/A'}</div>
      <div><strong>Date:</strong> ${latestPayment.paymentDate ? new Date(latestPayment.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}</div>
    </div>
  </div>
  
  <div class="details">
    <div><strong>Student Name:</strong> ${fee.student?.name || 'N/A'}</div>
    <div><strong>Student Email:</strong> ${fee.student?.email || 'N/A'}</div>
    <div><strong>Batch Code:</strong> ${fee.batch?.code || 'N/A'} (${fee.batch?.name || 'N/A'})</div>
    <div><strong>Payment Mode:</strong> ${latestPayment.paymentMode || 'N/A'}</div>
    <div><strong>Reference/Txn ID:</strong> ${latestPayment.referenceNumber || 'N/A'}</div>
    <div><strong>Remarks:</strong> ${latestPayment.remarks || '—'}</div>
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
=======
	<div class="header">
		<div>
			<h2>Ultra Smart Abacus</h2>
			<div>Fee Receipt</div>
		</div>
		<div>
			<strong>Receipt #</strong> <div>FEE-${fee.id}</div>
			<div>${new Date(fee.createdAt).toLocaleString()}</div>
		</div>
	</div>
	<div class="box">
		<p><strong>Student:</strong> ${fee.student?.name || 'N/A'}</p>
		<p><strong>Student Email:</strong> ${fee.student?.email || 'N/A'}</p>
		<p><strong>Amount Paid:</strong> ₹${(payment ? payment.amount : fee.paidAmount).toLocaleString()}</p>
		<p><strong>Payment Status:</strong> ${fee.status}</p>
		<p><strong>Transaction ID:</strong> ${(payment ? payment.txId : fee.txId) || 'N/A'}</p>
		<p><strong>Notes:</strong> ${fee.remarks || '—'}</p>
	</div>
	<div style="margin-top:24px;font-size:12px;color:#666">This is a system generated receipt.</div>
>>>>>>> b45c6b08f2c3412a020dae9668c3190529c2c059
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

<<<<<<< HEAD
  res.status(201).json({ success: true, data: demo });
});
=======
		// create a paid demo fee
		const totalAmount = Number(req.body.totalAmount) || 500; // default 500
		const paidAmount = totalAmount;
		const pendingAmount = 0;

		const demo = await prisma.fee.create({
			data: {
				studentId: student.id,
				totalAmount,
				paidAmount,
				pendingAmount,
				status: 'PAID',
				txId: `DEMO-${Date.now()}`,
				remarks: req.body.remarks || 'Demo paid fee for receipt testing'
			}
		});

		// create a payment record for the demo
		await prisma.feePayment.create({
			data: {
				feeId: demo.id,
				amount: paidAmount,
				txId: demo.txId,
				createdBy: req.user.id
			}
		});

		return res.status(201).json({ success: true, data: demo });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// FRANCHISE / ADMIN: Mark a payment against a fee (records amount paid, updates status)
export const markFeePayment = async (req, res) => {
	try {
		const { id } = req.params;
		const { amount, txId, remarks } = req.body;

		if (!amount || Number(amount) <= 0) {
			return res.status(400).json({ message: 'Invalid payment amount' });
		}

		const fee = await prisma.fee.findUnique({ where: { id: Number(id) }, include: { student: true } });
		if (!fee) return res.status(404).json({ message: 'Fee not found' });

		// compute new totals
		const newPaid = Number(fee.paidAmount || 0) + Number(amount);
		const newPending = Math.max(0, Number(fee.totalAmount || 0) - newPaid);
		const newStatus = newPending === 0 ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'PENDING');

		// append remarks with timestamp
		const appendedRemarks = `${fee.remarks || ''}` + (remarks ? `\n[${new Date().toLocaleString()}] ${remarks}` : `\n[${new Date().toLocaleString()}] Marked payment ₹${amount}`);

		const updated = await prisma.fee.update({
			where: { id: Number(id) },
			data: {
				paidAmount: newPaid,
				pendingAmount: newPending,
				status: newStatus,
				txId: txId || fee.txId,
				paymentDate: new Date(),
				remarks: appendedRemarks,
			},
			include: { student: true }
		});

		// record the individual payment
		const paymentRecord = await prisma.feePayment.create({
			data: {
				feeId: updated.id,
				amount: Number(amount),
				txId: txId || `FR-${Date.now()}`,
				createdBy: req.user.id
			}
		});

		// Build a small receipt payload for immediate download/use
		const receipt = {
			feeId: updated.id,
			student: updated.student,
			amount: Number(amount),
			totalPaid: updated.paidAmount,
			pendingAmount: updated.pendingAmount,
			txId: paymentRecord.txId || updated.txId,
			paymentDate: updated.paymentDate,
			remarks: appendedRemarks,
		};

		return res.status(200).json({ success: true, data: updated, receipt });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
>>>>>>> b45c6b08f2c3412a020dae9668c3190529c2c059
