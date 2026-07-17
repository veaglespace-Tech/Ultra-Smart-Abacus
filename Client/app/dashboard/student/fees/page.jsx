"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0));

const getStatusClasses = (status) => {
  switch (status) {
    case "PAID":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    case "PARTIAL":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "OVERDUE":
      return "border-rose-500/25 bg-rose-500/10 text-rose-300";
    default:
      return "border-rose-500/25 bg-rose-500/10 text-rose-300";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PARTIAL":
      return "Partial";
    case "OVERDUE":
      return "Overdue";
    default:
      return "Pending";
  }
};

export default function StudentFeesPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingFeeItem, setPayingFeeItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewFeeItem, setViewFeeItem] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.student.getFees();
      setFees((res?.data || []).map((fee) => {
        const totalAmount = Number(fee.totalAmount || 0);
        const paidAmount = Number(fee.paidAmount || 0);
        const fineAmount = Number(fee.fineAmount || 0);
        const discountAmount = Number(fee.discountAmount || 0);
        const netAmount = totalAmount + fineAmount - discountAmount;
        const pendingAmount = Math.max(netAmount - paidAmount, 0);

        return {
          id: fee.id,
          // default UI helper fields
          amount: pendingAmount > 0 ? pendingAmount : 0,
          paymentMode: fee.paymentMethod || "Cash",
          discount: discountAmount || 0,
          remark: fee.notes || "",
          studentName: fee.student?.name || "—",
          rollNo: fee.student?.rollNo || "—",
          course: fee.student?.batch?.course?.name || "—",
          batch: fee.student?.batch?.name || "—",
          totalAmount,
          paidAmount,
          pendingAmount,
          amount: pendingAmount > 0 ? pendingAmount : 0,
          date: fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : "—",
          status: fee.status,
          txId: fee.receiptNumber || `RCPT-${fee.id}`,
          paymentMethod: fee.paymentMethod || "—",
          notes: fee.notes || "",
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingFeeItem) return;

    try {
      const payload = {
        amount: Number(payingFeeItem.amount),
        paymentMethod: payingFeeItem.paymentMode || "Cash",
        notes: payingFeeItem.remark || payingFeeItem.notes || "",
        discount: Number(payingFeeItem.discount || 0),
      };

      await api.student.recordPayment(payingFeeItem.id, payload);
      setPaymentSuccess(`Payment of ₹${formatCurrency(payingFeeItem.amount)} recorded successfully.`);
      setShowPayModal(false);
      setPayingFeeItem(null);
      await fetchFees();
      setTimeout(() => setPaymentSuccess(""), 4000);
    } catch (error) {
      alert(error.message || "Payment failed");
    }
  };

  const outstandingBalance = fees.reduce((acc, curr) => acc + Number(curr.pendingAmount || 0), 0);

  const totalCollected = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  const overdueCount = fees.filter((f) => f.status === "OVERDUE").length;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SMART ABACUS", 14, 15);
    doc.setFontSize(12);
    doc.text("Student Fee Statement", 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Fee Installment", "Receipt", "Amount", "Due Date", "Status"]],
      body: fees.map((fee) => [fee.description, fee.txId, `₹${formatCurrency(fee.totalAmount)}`, fee.date, getStatusLabel(fee.status)]),
    });

    doc.save("Student_Fees_Report.pdf");
  };

  const downloadReceipt = (fee) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SMART ABACUS", 14, 15);
    doc.setFontSize(12);
    doc.text("Fee Receipt", 14, 25);
    doc.setFontSize(11);
    doc.text(`Receipt: ${fee.txId}`, 14, 38);
    doc.text(`Student: ${fee.description}`, 14, 48);
    doc.text(`Amount Paid: ₹${formatCurrency(fee.paidAmount)}`, 14, 58);
    doc.text(`Pending Amount: ₹${formatCurrency(fee.pendingAmount)}`, 14, 68);
    doc.text(`Due Date: ${fee.date}`, 14, 78);
    doc.text(`Payment Method: ${fee.paymentMethod}`, 14, 88);
    doc.text(`Status: ${getStatusLabel(fee.status)}`, 14, 98);

    doc.save(`Receipt_${fee.txId}.pdf`);
  };

  return (
    <div className="space-y-6">
      {paymentSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 shadow-inner flex items-center gap-2 animate-fade-in">
          <span className="text-lg">✔</span>
          <span>{paymentSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0b1220] border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">💰 Total Collection</p>
          <p className="text-xl font-black text-emerald-300">₹{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-[#0b1220] border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">📄 Outstanding Amount</p>
          <p className="text-xl font-black text-rose-300">₹{formatCurrency(outstandingBalance)}</p>
        </div>
        <div className="bg-[#0b1220] border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">👨‍🎓 Total Students</p>
          <p className="text-xl font-black text-slate-300">1</p>
        </div>
        <div className="bg-[#0b1220] border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">⚠️ Overdue Fees</p>
          <p className="text-xl font-black text-amber-300">{overdueCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-xl animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3 text-right">Total Fee</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Pending</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? <tr><td colSpan="11" className="px-6 py-4 text-center text-slate-400">Loading fees...</td></tr> : fees.map((fee) => {
                const canViewReceipt = fee.paidAmount > 0;
                return (
                  <tr key={fee.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-200">{fee.studentName}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{fee.rollNo}</td>
                    <td className="px-4 py-3">{fee.course}</td>
                    <td className="px-4 py-3">{fee.batch}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{formatCurrency(fee.totalAmount)}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{formatCurrency(fee.paidAmount)}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-300">₹{formatCurrency(fee.pendingAmount)}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{fee.date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClasses(fee.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />{getStatusLabel(fee.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{fee.txId}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setPayingFeeItem(fee); setShowPayModal(true); }} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs">Collect Fee</button>
                        <button onClick={() => { setViewFeeItem(fee); setShowViewModal(true); }} className="px-3 py-1 rounded-lg border border-white/10 text-xs">View</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && payingFeeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">Process Fee Payment</h3>
              <button onClick={() => { setShowPayModal(false); setPayingFeeItem(null); }} className="text-slate-400 hover:text-white transition-all cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Student</span><span className="font-bold text-slate-200">{payingFeeItem.studentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Due</span><span className="font-bold text-slate-200">₹{formatCurrency(payingFeeItem.pendingAmount)}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Payment Mode</label>
                  <select value={payingFeeItem.paymentMode} onChange={(e) => setPayingFeeItem({ ...payingFeeItem, paymentMode: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0b1220] border border-white/5 text-white text-xs">
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Amount</label>
                  <input type="number" value={payingFeeItem.amount} onChange={(e) => setPayingFeeItem({ ...payingFeeItem, amount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0b1220] border border-white/5 text-white text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Discount (optional)</label>
                <input type="number" value={payingFeeItem.discount} onChange={(e) => setPayingFeeItem({ ...payingFeeItem, discount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0b1220] border border-white/5 text-white text-xs" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Remark</label>
                <input value={payingFeeItem.remark} onChange={(e) => setPayingFeeItem({ ...payingFeeItem, remark: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0b1220] border border-white/5 text-white text-xs" />
              </div>

              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => { setShowPayModal(false); setPayingFeeItem(null); }} className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer">Receive Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewFeeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 text-slate-900 shadow-xl">
            <button onClick={() => { setShowViewModal(false); setViewFeeItem(null); }} className="absolute top-4 right-6 text-slate-600">✕</button>
            <h3 className="text-lg font-bold mb-4">Receipt Details</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Receipt No :</strong> {viewFeeItem.txId}</div>
              <div><strong>Student Name :</strong> {viewFeeItem.studentName}</div>
              <div><strong>Roll No :</strong> {viewFeeItem.rollNo}</div>
              <div><strong>Course :</strong> {viewFeeItem.course}</div>
              <div><strong>Batch :</strong> {viewFeeItem.batch}</div>
              <div><strong>Payment Date :</strong> {viewFeeItem.date}</div>

              <div className="pt-3 border-t mt-3">
                <div className="flex justify-between"><span>Total Fee</span><span>₹{formatCurrency(viewFeeItem.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Paid Amount</span><span>₹{formatCurrency(viewFeeItem.paidAmount)}</span></div>
                <div className="flex justify-between"><span>Pending</span><span>₹{formatCurrency(viewFeeItem.pendingAmount)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>₹{formatCurrency(viewFeeItem.discount)}</span></div>
                <div className="flex justify-between"><span>GST</span><span>₹0</span></div>
                <div className="pt-2 border-t mt-2 flex justify-between font-bold"><span>Net Amount</span><span>₹{formatCurrency(viewFeeItem.totalAmount - (viewFeeItem.discount || 0))}</span></div>
              </div>

              <div className="pt-4 flex gap-2">
                <button onClick={() => downloadReceipt(viewFeeItem)} className="px-4 py-2 bg-blue-600 text-white rounded">⬇ Download PDF</button>
                <button onClick={() => {
                  const printContent = `\nSMART ABACUS\n\nPayment Receipt\n\nReceipt No: ${viewFeeItem.txId}\nPayment Date: ${viewFeeItem.date}\n\nStudent: ${viewFeeItem.studentName}\nRoll No: ${viewFeeItem.rollNo}\nCourse: ${viewFeeItem.course}\nBatch: ${viewFeeItem.batch}\n\nTotal Fee: ₹${formatCurrency(viewFeeItem.totalAmount)}\nPaid: ₹${formatCurrency(viewFeeItem.paidAmount)}\nPending: ₹${formatCurrency(viewFeeItem.pendingAmount)}\nDiscount: ₹${formatCurrency(viewFeeItem.discount)}\n\n`;
                  const w = window.open('', '_blank');
                  w.document.write(`<pre>${printContent}</pre>`);
                  w.document.close();
                  w.focus();
                  w.print();
                }} className="px-4 py-2 bg-gray-200 rounded">🖨 Print Receipt</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
