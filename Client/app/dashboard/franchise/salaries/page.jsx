"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IndianRupee, Search, CreditCard, ArrowDownLeft, CheckCircle, 
  Clock, AlertCircle, Filter, Download, Plus, X, Calendar, User, Edit, FileText
} from "lucide-react";
import { api } from "@/services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalariesManagement() {
  const [teachers, setTeachers] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    bonus: "0",
    deductions: "0",
    paymentStatus: "PENDING",
    paymentDate: "",
    paymentMode: "Bank Transfer",
    referenceNumber: "",
    remarks: ""
  });

  // Calculate net salary dynamically
  const calculatedNetSalary = useMemo(() => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return Math.max(0, basic + bonus - deductions);
  }, [formData.basicSalary, formData.bonus, formData.deductions]);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.salary.getHistory();
      if (res.success) {
        setSalaries(res.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to fetch salary records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await api.admin.getTeachers();
      const list = res.teachers || res.data || [];
      setTeachers(list);
    } catch (err) {
      console.warn("Failed to load teachers list:", err.message);
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setSelectedSalaryId(null);
    setFormData({
      teacherId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: "",
      bonus: "0",
      deductions: "0",
      paymentStatus: "PENDING",
      paymentDate: "",
      paymentMode: "Bank Transfer",
      referenceNumber: "",
      remarks: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (salary) => {
    setEditMode(true);
    setSelectedSalaryId(salary.id);
    setFormData({
      teacherId: salary.teacherId,
      month: salary.month,
      year: salary.year,
      basicSalary: salary.basicSalary ? salary.basicSalary.toString() : "0",
      bonus: salary.bonus ? salary.bonus.toString() : "0",
      deductions: salary.deductions ? salary.deductions.toString() : "0",
      paymentStatus: salary.paymentStatus,
      paymentDate: (() => {
        if (!salary.paymentDate) return "";
        try {
          const d = new Date(salary.paymentDate);
          return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
        } catch (e) {
          return "";
        }
      })(),
      paymentMode: salary.paymentMode || "Bank Transfer",
      referenceNumber: salary.referenceNumber || "",
      remarks: salary.remarks || ""
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.teacherId) {
      setErrorMessage("Please select a teacher from the dropdown.");
      return;
    }

    const payload = {
      ...formData,
      teacherId: parseInt(formData.teacherId),
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      basicSalary: parseFloat(formData.basicSalary),
      bonus: parseFloat(formData.bonus) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null
    };

    try {
      if (editMode) {
        const res = await api.salary.update(selectedSalaryId, payload);
        if (res.success) {
          setSuccessMessage("Salary record updated successfully.");
          fetchData();
          setIsFormOpen(false);
        }
      } else {
        const res = await api.salary.create(payload);
        if (res.success) {
          setSuccessMessage("Salary record created successfully.");
          fetchData();
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save salary record.");
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!confirm("Are you sure you want to mark this salary as Paid?")) return;
    try {
      const res = await api.salary.pay(id, {
        paymentDate: new Date().toISOString(),
        paymentMode: "Bank Transfer"
      });
      if (res.success) {
        setSuccessMessage("Salary status updated to Paid.");
        fetchData();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update payment status.");
    }
  };

  // Filter Pipeline
  const filteredSalaries = useMemo(() => {
    return salaries.filter(s => {
      const teacherName = s.teacher?.name || "";
      const matchesSearch = teacherName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (s.referenceNumber && s.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMonth = filterMonth === "All" || s.month === parseInt(filterMonth);
      const matchesStatus = filterStatus === "All" || s.paymentStatus === filterStatus;
      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [salaries, searchQuery, filterMonth, filterStatus]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Employee ID", "Teacher Name", "Period", "Basic Salary (INR)", "Bonus (INR)", "Deductions (INR)", "Net Salary (INR)", "Status", "Payment Date", "Payment Mode", "Ref/Txn No"];
    const rows = filteredSalaries.map(s => [
      s.teacher?.id || "N/A",
      `"${s.teacher?.name || "Unknown"}"`,
      `"${MONTHS[s.month - 1]} ${s.year}"`,
      s.basicSalary,
      s.bonus,
      s.deductions,
      s.netSalary,
      s.paymentStatus,
      (() => {
        if (!s.paymentDate) return "N/A";
        try {
          const d = new Date(s.paymentDate);
          return isNaN(d.getTime()) ? "N/A" : d.toISOString().split("T")[0];
        } catch (e) {
          return "N/A";
        }
      })(),
      s.paymentMode || "N/A",
      s.referenceNumber || "N/A"
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Salary_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Salary Slip Printable Generator
  const triggerPrintSlip = (salary) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Salary Slip - ${salary.teacher?.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .container { border: 2px solid #ddd; padding: 30px; border-radius: 12px; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #1a202c; padding-bottom: 20px; }
            .logo { font-size: 22px; font-weight: 900; color: #4f46e5; letter-spacing: 1px; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; margin-top: 5px; }
            .title { font-size: 18px; font-weight: bold; margin-top: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; font-size: 13px; border-bottom: 1px solid #edf2f7; padding-bottom: 20px; }
            .info-item { display: flex; justify-content: space-between; padding-right: 20px; }
            .info-label { color: #718096; font-weight: 600; }
            .info-value { font-weight: bold; color: #2d3748; }
            .salary-table { w-full; width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 14px; }
            .salary-table th { background-color: #f7fafc; text-align: left; padding: 10px; border-bottom: 2px solid #edf2f7; color: #718096; }
            .salary-table td { padding: 12px 10px; border-bottom: 1px solid #edf2f7; }
            .total-row { font-weight: bold; background-color: #f8fafc; font-size: 15px; }
            .footer { margin-top: 50px; font-size: 12px; border-top: 1px solid #edf2f7; padding-top: 20px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-box { border-top: 1px dashed #cbd5e0; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; font-weight: bold; color: #4a5568; }
            @media print {
              body { padding: 0; }
              .container { border: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="container">
            <div class="header">
              <div class="logo">SMART ABACUS</div>
              <div class="subtitle">Official Remuneration Statement</div>
              <div class="title">Payslip for ${MONTHS[salary.month - 1]} ${salary.year}</div>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Employee Name:</span>
                <span class="info-value">${salary.teacher?.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Franchise Center:</span>
                <span class="info-value">${salary.franchise?.name || "Main Branch"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee ID:</span>
                <span class="info-value">EMP-${salary.teacher?.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Statement Date:</span>
                <span class="info-value">${new Date(salary.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <table class="salary-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style="text-align: right; font-weight: bold;">₹${Number(salary.basicSalary || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Additions (Bonus / Incentives)</td>
                  <td style="text-align: right; color: #2f855a;">+ ₹${Number(salary.bonus || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Deductions (Taxes / Leaves)</td>
                  <td style="text-align: right; color: #c53030;">- ₹${Number(salary.deductions || 0).toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td>Net Remuneration Disbursed</td>
                  <td style="text-align: right;">₹${Number(salary.netSalary || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="info-grid" style="margin-top: 30px; border-bottom: none;">
              <div class="info-item">
                <span class="info-label">Payment Status:</span>
                <span class="info-value" style="color: ${salary.paymentStatus === 'PAID' ? '#2f855a' : '#dd6b20'};">${salary.paymentStatus}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Settlement Mode:</span>
                <span class="info-value">${salary.paymentMode || "Pending"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Date:</span>
                <span class="info-value">${salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString() : "Pending"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Reference ID / Txn Hash:</span>
                <span class="info-value" style="font-family: monospace; font-size: 11px;">${salary.referenceNumber || "N/A"}</span>
              </div>
            </div>

            <div class="footer">
              <p><strong>Remarks:</strong> ${salary.remarks || "No remarks annotated for this billing cycle."}</p>
              <div class="signatures">
                <div class="signature-box">Recipient Signature</div>
                <div class="signature-box">Authorized Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

  printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 p-4 md:p-6 text-slate-800 dark:text-slate-200 max-w-[1600px] mx-auto min-h-screen">      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">SALARY MANAGEMENT CONSOLE</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Generate monthly payslips, issue teacher payouts, and audit center payroll ledger.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button 
            onClick={handleExportCSV} 
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine"
          >
            <Plus size={14} /> Create Salary Record
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-semibold">
          <CheckCircle size={16} /> <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold">
          <AlertCircle size={16} /> <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by teacher name or Txn ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-650/15"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filter Month:</span>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-650/15"
            >
              <option value="All">All Months</option>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-650/15"
            >
              <option value="All">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-xs font-semibold text-slate-450">Loading salaries registry...</div>
          ) : filteredSalaries.length === 0 ? (
            <div className="p-10 text-center text-xs font-semibold text-slate-450">No salary records found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <th className="py-4 px-6">Teacher</th>
                  <th className="py-4 px-6">Period</th>
                  <th className="py-4 px-6">Salary Details</th>
                  <th className="py-4 px-6">Net Remuneration</th>
                  <th className="py-4 px-6">Disbursal Node</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold">
                {filteredSalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all duration-100">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        {s.teacher?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-slate-100">{s.teacher?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">EMP-{s.teacher?.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-black text-slate-700 dark:text-slate-300">
                      {MONTHS[s.month - 1]} {s.year}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 space-y-0.5">
                      <p>Basic: ₹{Number(s.basicSalary ?? s.basic_salary ?? s.basic ?? 0).toLocaleString()}</p>
                      <p className="text-emerald-600">Bonus: +₹{Number(s.bonus || 0).toLocaleString()}</p>
                      <p className="text-rose-500">Ded: -₹{Number(s.deductions || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      ₹{Number(s.netSalary || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 space-y-0.5">
                      {s.paymentStatus === "PAID" ? (
                        <>
                          <p className="font-bold">{s.paymentMode}</p>
                          <p className="text-[10px] font-mono">{s.referenceNumber || "No Ref No"}</p>
                        </>
                      ) : (
                        <p className="italic text-slate-400">Awaiting disbursement</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black border uppercase ${
                        s.paymentStatus === "PAID" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" 
                          : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                      }`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.paymentStatus !== "PAID" && (
                          <button 
                            onClick={() => handleMarkAsPaid(s.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-250 dark:border-emerald-900 cursor-pointer"
                            title="Mark as Paid"
                          >
                            Disburse
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="Edit Salary"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => triggerPrintSlip(s)}
                          className="p-1.5 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-900 cursor-pointer"
                          title="Print Payslip"
                        >
                          <FileText size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Salary Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">
                {editMode ? "Modify Salary Details" : "Compose Monthly Payout"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1.5 font-bold">Select Teacher</label>
                  <select 
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    disabled={editMode || teachersLoading || teachers.length === 0}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  >
                    {teachersLoading ? (
                      <option value="">Loading teachers...</option>
                    ) : teachers.length === 0 ? (
                      <option value="">No teachers registered in system</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Select a Teacher --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id.toString()}>
                            {t.name} (ID: {t.id})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Month</label>
                  <select 
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    disabled={editMode}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Year</label>
                  <input 
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    disabled={editMode}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Basic Salary (INR)</label>
                  <input 
                    type="number"
                    name="basicSalary"
                    required
                    placeholder="Enter basic pay sum"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Bonus Additions (INR)</label>
                  <input 
                    type="number"
                    name="bonus"
                    placeholder="Optional bonus"
                    value={formData.bonus}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Deductions (INR)</label>
                  <input 
                    type="number"
                    name="deductions"
                    placeholder="Taxes, leaves, deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Net Remuneration (Auto)</label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl px-3 py-2.5 text-sm">
                    ₹{calculatedNetSalary.toLocaleString()}
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                  <label className="block text-slate-400 mb-1.5 font-bold">Payment Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentStatus" 
                        value="PENDING" 
                        checked={formData.paymentStatus === "PENDING"}
                        onChange={handleInputChange}
                        className="accent-indigo-600"
                      />
                      <span>Pending</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentStatus" 
                        value="PAID" 
                        checked={formData.paymentStatus === "PAID"}
                        onChange={handleInputChange}
                        className="accent-indigo-600"
                      />
                      <span>Paid</span>
                    </label>
                  </div>
                </div>

                {formData.paymentStatus === "PAID" && (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">Settlement Mode</label>
                      <select 
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">Reference / Transaction Number</label>
                      <input 
                        type="text"
                        name="referenceNumber"
                        placeholder="Txn ID, Cheque No"
                        value={formData.referenceNumber}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-400 mb-1.5 font-bold">Payment Date</label>
                      <input 
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1.5 font-bold">Remarks / Internal Annotations</label>
                  <textarea 
                    name="remarks"
                    placeholder="Enter context, memo, or comments..."
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-850 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-350 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl shadow-md cursor-pointer"
                >
                  {editMode ? "Apply Changes" : "Create Statement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
