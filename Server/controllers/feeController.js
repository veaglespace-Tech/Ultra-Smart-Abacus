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
			orderBy: [{ createdAt: 'desc' }]
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
				student: true
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

		// Build simple HTML receipt
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
		<p><strong>Amount Paid:</strong> ₹${fee.paidAmount.toLocaleString()}</p>
		<p><strong>Payment Status:</strong> ${fee.status}</p>
		<p><strong>Transaction ID:</strong> ${fee.txId || 'N/A'}</p>
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