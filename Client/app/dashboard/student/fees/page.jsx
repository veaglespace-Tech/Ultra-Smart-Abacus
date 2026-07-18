"use client";

import React, { useState } from "react";
import { useStudentData } from "../StudentContext";

export default function StudentFeesPage() {
  const { fees, payFee, profile } = useStudentData();

  // Pay Fee Mock modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingFeeItem, setPayingFeeItem] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!payingFeeItem) return;

    const newTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    payFee(payingFeeItem.id, newTxId);

    setPaymentSuccess(`Payment of ₹${payingFeeItem.amount} for "${payingFeeItem.description}" processed successfully!`);
    setShowPayModal(false);
    setPayingFeeItem(null);
    setTimeout(() => setPaymentSuccess(""), 4000);
  };

  const outstandingBalance = fees
    .filter(f => f.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Payment notification banner */}
      {paymentSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300 shadow-inner flex items-center gap-2 animate-fade-in">
          <span className="text-lg">✔</span>
          <span>{paymentSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Course Fees & Transaction Billing Log</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light mt-0.5">Pay outstanding tuition fees online or check past payments receipts.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Outstanding Balance</span>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
            ₹{outstandingBalance}.00
          </span>
        </div>
      </div>

      {/* Fees table list */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-xl animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="px-6 py-4">Payment Item</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4 font-mono text-center">Amount</th>
                <th className="px-6 py-4">Due/Paid Date</th>
                <th className="px-6 py-4">Status Alert</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {fees.map((fee) => {
                // treat any fee with a positive `amount` as having a payment (Paid or Partial)
                const hasPayment = fee.lastPaymentId || Number(fee.amount) > 0;
                const isFullyPaid = fee.status === "Paid";
                return (
                  <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{fee.description}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{fee.txId}</td>
                    <td className="px-6 py-4 font-mono text-center text-slate-800 dark:text-slate-300">₹{fee.amount}.00</td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{fee.date}</td>
                    <td className="px-6 py-4">
                      {isFullyPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                          Paid Successfully
                        </span>
                      ) : hasPayment ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-amber-500/25 bg-amber-500/10 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Partial Payment
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                          Payment Due
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isFullyPaid ? (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/fees/${fee.id}/receipt`, {
                                method: 'GET',
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem('abacus_auth_token')}`
                                }
                              });
                              if (!res.ok) throw new Error('Failed to download');
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `FeeReceipt_${fee.id}.html`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              alert('Unable to download receipt');
                              console.error(err);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          Download Receipt
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOCK FEES PAYMENT POPUP MODAL */}
      {showPayModal && payingFeeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/40 dark:bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Process Online Fee Payment</h3>
              <button
                onClick={() => {
                  setShowPayModal(false);
                  setPayingFeeItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Item:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{payingFeeItem.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tuition Fee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{payingFeeItem.amount}.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-white/5 pt-2 mt-2 font-bold text-sm">
                  <span className="text-slate-400">Total Payable:</span>
                  <span className="text-blue-600 dark:text-blue-400">₹{payingFeeItem.amount}.00</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neha Patel"
                  defaultValue={profile.name}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Card Details *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• 1234"
                    maxLength="19"
                    className="col-span-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all text-center"
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
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
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
    </div>
  );
}
