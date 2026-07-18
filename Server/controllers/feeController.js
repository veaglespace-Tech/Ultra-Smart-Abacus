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
};

// GET FEE RECEIPT (downloadable HTML)
export const getFeeReceipt = async (req, res) => {
	try {
		const { id } = req.params;

		const fee = await prisma.fee.findUnique({
			where: { id: Number(id) },
			include: {
				student: true,
				payments: true
			}
		});

		if (!fee) return res.status(404).json({ message: 'Fee not found' });

		// Access control: if student, ensure they own the fee
		if (req.user.role === 'STUDENT') {
			let student = await prisma.student.findUnique({ where: { userId: req.user.id } });
			if (!student && req.user && req.user.email) {
				student = await prisma.student.findFirst({ where: { email: req.user.email } });
			}
			if (!student || student.id !== fee.studentId) {
				return res.status(403).json({ message: 'Access denied' });
			}
		}

	 	// if paymentId or txId provided, prefer rendering receipt for that payment
	 	const { paymentId, txId: qTxId } = req.query || {};

		let payment = null;
		if (paymentId) {
			payment = await prisma.feePayment.findUnique({ where: { id: Number(paymentId) } });
		} else if (qTxId) {
			payment = await prisma.feePayment.findFirst({ where: { txId: qTxId } });
		}

		const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Fee Receipt - ${fee.id}</title>
	<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} .header{display:flex;justify-content:space-between;align-items:center} .box{border:1px solid #eee;padding:18px;border-radius:8px;margin-top:20px}</style>
</head>
<body>
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
</body>
</html>`;

		res.setHeader('Content-Disposition', `attachment; filename=FeeReceipt_${fee.id}.html`);
		res.setHeader('Content-Type', 'text/html');
		return res.send(html);

	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// TEMP: Create a demo PAID fee for the logged-in student (useful for testing receipts)
export const createDemoFee = async (req, res) => {
	try {
		// find student by logged in user
		let student = await prisma.student.findUnique({ where: { userId: req.user.id } });

		// fallback to matching by email
		if (!student && req.user && req.user.email) {
			student = await prisma.student.findFirst({ where: { email: req.user.email } });
		}

		if (!student) {
			return res.status(404).json({ message: 'Student record not found for current user' });
		}

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