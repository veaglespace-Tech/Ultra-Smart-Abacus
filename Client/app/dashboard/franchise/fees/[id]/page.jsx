"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Calendar, History, Printer, X, CheckCircle2, Receipt, Milestone, CreditCard, FileText, Bell, Share2 } from 'lucide-react';

export default function StudentFeeDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // मॉडेल्ससाठी स्टेट्स
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false); 
  const [selectedHistory, setSelectedHistory] = useState(null);

  // फॉर्म डेटा स्टेट
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [reminderChannel, setReminderChannel] = useState("WhatsApp");

  // सर्व विद्यार्थ्यांचा मॉक डेटा लेजर
  const [studentDetails, setStudentDetails] = useState({
    "TXN-701": { id: "TXN-701", name: "Isha Sharma", parent: "Rajesh Sharma", phone: "+91 98765 43210", email: "isha@email.com", level: "Level 2", batch: "Weekend Super Kids", totalFees: 15000, paidFees: 11500, balance: 3500, status: "Overdue" },
    "TXN-699": { id: "TXN-699", name: "Rohan Deshmukh", parent: "Anil Deshmukh", phone: "+91 91234 56789", email: "rohan@email.com", level: "Level 1", batch: "Morning Standard", totalFees: 15000, paidFees: 10500, balance: 4500, status: "Overdue" },
    "TXN-654": { id: "TXN-654", name: "Aditya Patil", parent: "Sanjay Patil", phone: "+91 99887 76655", email: "aditya@email.com", level: "Level 4", batch: "Evening Advance", totalFees: 15000, paidFees: 15000, balance: 0, status: "Paid" },
    "TXN-642": { id: "TXN-642", name: "Ananya Joshi", parent: "Sanjay Joshi", phone: "+91 98901 23456", email: "ananya@email.com", level: "Level 3", batch: "Evening Advance", totalFees: 15000, paidFees: 15000, balance: 0, status: "Paid" }
  });

  // पास्ट ट्रान्झॅक्शन्स
  const [pastPayments, setPastPayments] = useState([
    { receiptNo: "RCP-9021", title: "Term 1 Tuition Fees", date: "2026-05-12", amount: 5000, mode: "UPI", handler: "Center Admin" },
    { receiptNo: "RCP-8843", title: "Admission & Abacus Kit Charges", date: "2026-05-02", amount: 6500, mode: "Cash", handler: "Franchise Owner" }
  ]);

  const currentStudent = studentDetails[id] || studentDetails["TXN-701"];

  // फी अपडेट लॉजिक
  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    const collected = parseInt(paymentAmount) || 0;
    if (collected <= 0) return;

    const newPaidFees = currentStudent.paidFees + collected;
    const newBalance = Math.max(0, currentStudent.totalFees - newPaidFees);
    const newStatus = newBalance === 0 ? "Paid" : "Overdue";

    setStudentDetails({
      ...studentDetails,
      [currentStudent.id]: { ...currentStudent, paidFees: newPaidFees, balance: newBalance, status: newStatus }
    });

    const newReceipt = {
      receiptNo: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Partial Tuition Fee Payment",
      date: new Date().toISOString().split('T')[0],
      amount: collected,
      mode: paymentMode,
      handler: "Center Admin"
    };
    setPastPayments([newReceipt, ...pastPayments]);
    setIsUpdateModalOpen(false);
    setPaymentAmount("");
  };

  const handleHistoryClick = (payment) => {
    setSelectedHistory(payment);
    setIsHistoryModalOpen(true);
  };

  const handleSendReminder = (e) => {
    e.preventDefault();
    alert(`Reminder successfully dispatched to ${currentStudent.parent} via ${reminderChannel}!`);
    setIsReminderModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs text-[#2c3539] relative px-4 py-6 bg-[#fcfbfa] max-w-7xl mx-auto font-sans min-h-screen">
      
      {/* 🌟 HERE IS THE UPDATED RESPONSIVE HEADER WITH CLEAR BACK OPTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-4">
        <div className="flex items-center gap-3">
          
          {/* कडक आणि स्पष्ट बॅक बटन */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 px-3 py-2 bg-[#fcfbfa] border border-[#e2dcd0] hover:bg-[#f4f0e6] rounded-xl text-[#7a8475] hover:text-[#1a202c] transition-all cursor-pointer group shadow-sm"
            title="Go Back to Student List"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold tracking-wide">Back to List</span>
          </button>

          <div className="h-8 w-px bg-[#e2dcd0] hidden sm:block mx-1" />

          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-black text-[#4a5d4e] font-mono tracking-wider">{currentStudent.id}</span>
            <h2 className="text-lg sm:text-xl font-black text-[#1a202c] mt-0.5 tracking-tight">Student Invoice Profile</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🎯 कंडिशनल रिमाइंडर */}
          {currentStudent.status !== 'Paid' && (
            <button 
              onClick={() => setIsReminderModalOpen(true)}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bell size={12} /> Send Reminder
            </button>
          )}
          <span className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider font-mono ${
            currentStudent.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            ● {currentStudent.status}
          </span>
        </div>
      </div>

      {/* 📊 Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* डावा भाग */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* वैयक्तिक माहिती */}
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#1a202c] flex items-center gap-2 border-b border-[#e2dcd0] pb-2">
              <User size={14} className="text-[#4a5d4e]" /> Personal & Academic Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#2c3539] font-medium">
              <div><p className="font-bold text-[#7a8475] uppercase text-[9px]">Student Name</p><p className="text-[#1a202c] text-sm font-black mt-0.5">{currentStudent.name}</p></div>
              <div><p className="font-bold text-[#7a8475] uppercase text-[9px]">Parent/Guardian</p><p className="text-[#2c3539] font-semibold mt-0.5">{currentStudent.parent}</p></div>
              <div><p className="font-bold text-[#7a8475] uppercase text-[9px]">Contact Number</p><p className="text-[#2c3539] font-mono mt-0.5 flex items-center gap-1"><Phone size={11} className="text-[#7a8475]"/> {currentStudent.phone}</p></div>
              <div><p className="font-bold text-[#7a8475] uppercase text-[9px]">Abacus Level</p><p className="text-[#4a5d4e] font-bold mt-0.5 inline-flex items-center gap-1 bg-[#f4f0e6] px-2 py-0.5 border border-[#e2dcd0] rounded-md">🏆 {currentStudent.level}</p></div>
              <div className="sm:col-span-2"><p className="font-bold text-[#7a8475] uppercase text-[9px]">Assigned Batch</p><p className="text-blue-800 font-bold mt-0.5 bg-blue-50 px-2.5 py-1 border border-blue-200 rounded-xl w-fit">{currentStudent.batch}</p></div>
            </div>
          </div>

          {/* पेमेंट टाइमलाईन */}
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#1a202c] flex items-center gap-2 border-b border-[#e2dcd0] pb-2">
              <History size={14} className="text-[#4a5d4e]" /> Past Payment Timeline
            </h3>
            <div className="space-y-2.5 font-mono">
              {pastPayments.map((payment) => (
                <div 
                  key={payment.receiptNo}
                  onClick={() => handleHistoryClick(payment)}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-[#fcfbfa] hover:bg-[#f4f0e6]/50 border border-[#e2dcd0] rounded-xl transition-all cursor-pointer group gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f4f0e6] border border-[#e2dcd0] rounded-lg text-emerald-700"><Receipt size={14} /></div>
                    <div>
                      <p className="text-[#1a202c] font-bold text-xs group-hover:text-[#4a5d4e] transition-colors">{payment.title}</p>
                      <p className="text-[10px] text-[#7a8475] flex items-center gap-1.5 mt-0.5"><Calendar size={11}/> {payment.date} | ID: {payment.receiptNo}</p>
                    </div>
                  </div>
                  <p className="text-emerald-700 font-black text-sm self-end sm:self-center">₹{payment.amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* उजवा भाग (फी ब्रेकअप समरी) */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${currentStudent.status === 'Paid' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            <h3 className="text-sm font-bold text-[#1a202c] border-b border-[#e2dcd0] pb-2">Fee Structure Breakdown</h3>
            <div className="space-y-3 font-mono text-[#2c3539] font-medium">
              <div className="flex justify-between"><span>Total Cost:</span><span className="text-[#1a202c] font-bold">₹{currentStudent.totalFees.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-emerald-700 font-bold"><span>Total Paid:</span><span>₹{currentStudent.paidFees.toLocaleString('en-IN')}</span></div>
              <div className="border-t border-[#e2dcd0] pt-2.5 flex justify-between font-bold text-sm">
                <span className="text-[#2c3539]">Outstanding:</span>
                <span className={currentStudent.status === 'Paid' ? 'text-emerald-700' : 'text-rose-700'}>₹{currentStudent.balance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button onClick={() => setIsPrintModalOpen(true)} className="w-full bg-[#4a5d4e] hover:bg-[#3d4d40] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-xs">
                <Printer size={13} /> Print Full Statement
              </button>
              
              {currentStudent.status !== 'Paid' && (
                <button onClick={() => setIsUpdateModalOpen(true)} className="w-full bg-[#f4f0e6] hover:bg-[#e2dcd0] border border-[#e2dcd0] text-[#2c3539] font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs">
                  <CreditCard size={13} className="text-rose-600" /> Update Payment Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 १. PAYMENT REMINDER POP-UP */}
      {isReminderModalOpen && currentStudent.status !== 'Paid' && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-5 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsReminderModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] cursor-pointer"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-4 text-rose-700 font-bold border-b border-[#e2dcd0] pb-2">
              <Bell size={14} />
              <h3 className="text-[#1a202c] font-black font-mono uppercase text-xs tracking-wider">Send Outstandings Reminder</h3>
            </div>
            <div className="bg-[#f4f0e6]/50 p-3 rounded-xl border border-[#e2dcd0] text-[11px] mb-4 space-y-1 text-[#2c3539] font-medium font-mono">
              <p><strong>Parent Name:</strong> {currentStudent.parent}</p>
              <p><strong>Due Amount:</strong> <span className="text-rose-700 font-bold">₹{currentStudent.balance}</span></p>
            </div>
            <form onSubmit={handleSendReminder} className="space-y-4">
              <div>
                <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Select Gateway</label>
                <select value={reminderChannel} onChange={(e) => setReminderChannel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs font-mono focus:outline-none focus:border-[#4a5d4e]">
                  <option value="WhatsApp">WhatsApp Gateway</option>
                  <option value="SMS">Direct SMS Portal</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-2 text-xs">
                <Share2 size={13} /> Dispatch Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔵 २. CORPORATE RECEIPT SLIP POP-UP */}
      {isHistoryModalOpen && selectedHistory && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-2xl p-5 shadow-2xl relative font-mono text-[11px] border border-gray-300">
            <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer bg-gray-100 p-1.5 rounded-full"><X size={14} /></button>
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-4">
              <h2 className="text-black font-black text-sm uppercase tracking-wide">SMART ABACUS ACADEMY</h2>
              <p className="text-[9px] text-gray-500 mt-0.5">Franchise Payment Receipt Slip</p>
            </div>
            <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Receipt No:</span><span className="font-bold">{selectedHistory.receiptNo}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date Paid:</span><span>{selectedHistory.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Student Name:</span><span className="font-bold">{currentStudent.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Type:</span><span>{selectedHistory.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mode:</span><span className="font-bold text-blue-600">{selectedHistory.mode}</span></div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center mb-6">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Amount Received</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">₹{selectedHistory.amount.toLocaleString('en-IN')}</p>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">✔ SUCCESS</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-gray-100 text-[9px] text-gray-400">
              <div><p>Issued By: {selectedHistory.handler}</p><p className="mt-1 font-bold text-gray-600">Smart Abacus Seal</p></div>
              <div className="text-right"><div className="w-20 h-px bg-gray-400 mx-auto mb-1"></div><p className="font-bold text-gray-600">Authorized Sign</p></div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-5 bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs">
              <Printer size={13} /> Print This Slip
            </button>
          </div>
        </div>
      )}

      {/* 📄 ३. PRINT FULL LEDGER PREVIEW POP-UP */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-xl relative max-h-[90vh] overflow-y-auto print:max-h-full print:border-none print:bg-white print:text-black">
            <button onClick={() => setIsPrintModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] cursor-pointer print:hidden"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-4 text-[#4a5d4e] font-bold border-b border-[#e2dcd0] pb-2 print:border-black print:text-black"><FileText size={14} /><h3 className="text-[#1a202c] font-black font-mono uppercase text-xs tracking-wider print:text-black">Ledger Statement Preview</h3></div>
            <div id="print-area" className="space-y-4 font-mono text-[11px] bg-[#f4f0e6]/40 p-4 rounded-xl border border-[#e2dcd0] print:bg-white print:text-black print:border-none">
              <div className="text-center border-b border-[#e2dcd0] pb-3 print:border-black"><h2 className="text-[#1a202c] font-black text-sm tracking-widest uppercase print:text-black">SMART ABACUS ACADEMY</h2><p className="text-[10px] text-[#7a8475] mt-0.5 print:text-black">Franchise Fee Audit Statement Ledger</p></div>
              <div className="grid grid-cols-2 gap-y-2 text-[#2c3539] print:text-black border-b border-[#e2dcd0]/60 pb-3 print:border-black">
                <div><span className="text-[#7a8475] print:text-gray-500">Invoice ID:</span> <span className="text-[#1a202c] font-bold print:text-black">{currentStudent.id}</span></div>
                <div><span className="text-[#7a8475] print:text-gray-500">Student:</span> <span className="text-[#1a202c] font-bold print:text-black">{currentStudent.name}</span></div>
              </div>
              <div className="bg-[#fcfbfa] p-3 rounded-xl space-y-1.5 border border-[#e2dcd0] text-[#2c3539] print:bg-gray-100 print:text-black print:border-none">
                <div className="flex justify-between"><span>Total Course Cost:</span><span className="text-[#1a202c] print:text-black">₹{currentStudent.totalFees}</span></div>
                <div className="flex justify-between text-emerald-700 print:text-black"><span>Total Amount Paid:</span><span>₹{currentStudent.paidFees}</span></div>
                <div className="flex justify-between font-bold border-t border-[#e2dcd0] pt-1.5 text-[#1a202c] print:text-black print:border-black"><span>Net Outstanding Balance:</span><span className={currentStudent.status === 'Paid' ? 'text-emerald-700' : 'text-rose-700'}>₹{currentStudent.balance}</span></div>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-4 py-2.5 rounded-xl bg-[#4a5d4e] hover:bg-[#3d4d40] text-white font-black cursor-pointer flex items-center justify-center gap-1.5 print:hidden text-xs"> <Printer size={14} /> Trigger System Print / Save PDF</button>
          </div>
        </div>
      )}

      {/* 🟢 ४. UPDATE FEE STATUS POP-UP */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-5 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsUpdateModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] cursor-pointer"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-4 text-[#4a5d4e] font-bold border-b border-[#e2dcd0] pb-2"><Milestone size={14} /><h3 className="text-[#1a202c] font-black font-mono uppercase text-xs tracking-wider">Collect Outstanding Fee</h3></div>
            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Amount to Collect (₹)</label>
                <input type="number" max={currentStudent.balance} required placeholder="Enter amount..." value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs font-mono focus:outline-none focus:border-[#4a5d4e]" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#4a5d4e] hover:bg-[#3d4d40] text-white font-black cursor-pointer text-xs">Confirm & Add Slip</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}