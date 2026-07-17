"use client";

import React, { useState } from "react";
import { useStudentData } from "../StudentContext";

export default function StudentFeesPage() {
  const { fees, payFee, profile } = useStudentData();

  // Pay Fee Mock modal states
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

  const outstandingBalance = fees
    .filter(f => f.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {paymentSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-300 shadow-inner flex items-center gap-2 animate-fade-in">
          <span className="text-lg">✔</span>
          <span>{paymentSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white">Course Fees & Transaction Billing Log</h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Pay outstanding tuition fees online or check past payments receipts.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Outstanding Balance</span>
          <span className="text-xl font-black text-rose-400 font-mono">
            ₹{outstandingBalance}.00
          </span>
        </div>
      </div>

      {/* Fees table list */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-xl animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="px-6 py-4">Payment Item</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4 font-mono text-center">Amount</th>
                <th className="px-6 py-4">Due/Paid Date</th>
                <th className="px-6 py-4">Status Alert</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {fees.map((fee) => {
                const isPaid = fee.status === "Paid";
                return (
                  <tr key={fee.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{fee.description}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{fee.txId}</td>
                    <td className="px-6 py-4 font-mono text-center text-slate-300">₹{fee.amount}.00</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{fee.date}</td>
                    <td className="px-6 py-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Paid Successfully
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-rose-500/25 bg-rose-500/10 text-rose-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Payment Due
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => alert(`Receipt details for ${fee.txId}:\n-------------------------------\nItem: ${fee.description}\nAmount Paid: ₹${fee.amount}.00\nDate: ${fee.date}\nStatus: Verified`)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingFeeItem(fee);
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs text-white font-bold transition-all active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                          Pay Fee Now
                        </button>
                      )}
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
              <h3 className="text-base font-bold text-white">Process Online Fee Payment</h3>
              <button
                onClick={() => {
                  setShowPayModal(false);
                  setPayingFeeItem(null);
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Item:</span>
                  <span className="font-bold text-slate-200">{payingFeeItem.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tuition Fee:</span>
                  <span className="font-bold text-slate-200">₹{payingFeeItem.amount}.00</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-2 font-bold text-sm">
                  <span className="text-slate-400">Total Payable:</span>
                  <span className="text-blue-400">₹{payingFeeItem.amount}.00</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neha Patel"
                  defaultValue={profile.name}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Card Details *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• 1234"
                    maxLength="19"
                    className="col-span-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all text-center"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setPayingFeeItem(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer"
                >
                  Process Payment
                </button>
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
