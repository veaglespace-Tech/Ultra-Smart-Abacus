"use client";

import React, { useState } from "react";
import { useAdminData } from "../AdminContext";
import { 
  Building2, ShieldCheck, CreditCard, Bell, Package, 
  Save, RotateCcw, CheckCircle, AlertTriangle, Info,
  Lock, Wrench, FileText, Smartphone, Mail, Globe
} from "lucide-react";

export default function SettingsPage() {
  const { settings, setSettings } = useAdminData();
  const [activeTab, setActiveTab] = useState("general"); // general, security, finance, notifications, inventory
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if external settings change
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleToggle = (key, dangerWarning = false) => {
    if (dangerWarning && !formData[key]) {
      const confirmed = confirm(
        `WARNING: Toggling '${key}' will alter administrative security policies. Do you want to proceed?`
      );
      if (!confirmed) return;
    }
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setSettings(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 400);
  };

  const handleReset = () => {
    if (confirm("Reset all system configuration settings to factory default values?")) {
      const DEFAULT_VALUES = {
        organizationName: "Smart Abacus ERP Academy",
        contactEmail: "admin@smartabacus.com",
        contactPhone: "+91 98765 43210",
        address: "Central HQ, Main Road, Pune, Maharashtra",
        currency: "INR (₹)",
        academicYear: "2026-2027",

        allowPublicRegister: false,
        maintenanceMode: false,
        sessionTimeout: "30",
        enforceStrongPassword: true,
        twoFactorAuth: false,

        defaultMonthlyFee: "1500",
        lateFeePerDay: "50",
        autoApproveFranchise: false,
        invoicePrefix: "INV-2026-",
        taxRate: "18",

        emailAlerts: true,
        feeReminders: true,
        smsAlerts: false,
        notificationEmail: "alerts@smartabacus.com",

        lowStockThreshold: "15",
        autoRestockAlert: true
      };
      setFormData(DEFAULT_VALUES);
      setSettings(DEFAULT_VALUES);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">SYSTEM CONFIGURATION & GOVERNANCE HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">
            Manage organization parameters, security feature flags, billing defaults, and system alert triggers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={14} className="text-slate-500" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/20"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving Configuration..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-inner flex items-center gap-2 transition-all">
          <CheckCircle size={16} />
          <span>System configuration settings updated and saved successfully!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 text-xs font-bold overflow-x-auto pb-1">
        {[
          { id: "general", label: "Organization & Profile", icon: Building2 },
          { id: "security", label: "Security & Governance", icon: ShieldCheck },
          { id: "finance", label: "Billing & Finance", icon: CreditCard },
          { id: "notifications", label: "Notifications & Alerts", icon: Bell },
          { id: "inventory", label: "Inventory Thresholds", icon: Package }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* TAB 1: ORGANIZATION & GENERAL */}
        {activeTab === "general" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Building2 size={16} className="text-orange-500" />
              <span>Organization Identity & Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Smart Abacus Academy"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Academic Session / Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 2026-2027"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Administrative Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Contact Support Phone Number
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Default Operational Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency || "INR (₹)"}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none cursor-pointer font-bold"
                >
                  <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                  <option value="USD ($)">USD - US Dollar ($)</option>
                  <option value="EUR (€)">EUR - Euro (€)</option>
                  <option value="GBP (£)">GBP - British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  HQ Physical Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & GOVERNANCE */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <ShieldCheck size={16} className="text-rose-500" />
              <span>Access Control & Feature Flags</span>
            </div>

            {/* Toggle list */}
            <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* Toggle 1: Public Register */}
              <div className="flex items-start justify-between gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Allow Public Account Self-Registration</span>
                    {formData.allowPublicRegister && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800">
                        Warning
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    If enabled, anyone can visit the registration portal to create student/franchise accounts directly without admin invitation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("allowPublicRegister", true)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.allowPublicRegister ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.allowPublicRegister ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Toggle 2: Maintenance Mode */}
              <div className="flex items-start justify-between gap-6 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>System Maintenance Mode</span>
                    {formData.maintenanceMode && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-amber-100 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800">
                        Active Maintenance
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Locks non-admin users (Teachers, Franchises, Students) out of the portal and displays a scheduled maintenance notice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("maintenanceMode", true)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.maintenanceMode ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Toggle 3: Strong Password */}
              <div className="flex items-start justify-between gap-6 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Enforce Strong Password Policy</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Requires new passwords to contain at least 8 characters including numbers and special symbols.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("enforceStrongPassword")}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.enforceStrongPassword ? "bg-purple-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.enforceStrongPassword ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Toggle 4: 2FA */}
              <div className="flex items-start justify-between gap-6 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA) for Admins</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Prompts Super Administrators for email/SMS OTP verification upon login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("twoFactorAuth")}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.twoFactorAuth ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.twoFactorAuth ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 w-full sm:w-64">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                Idle Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                name="sessionTimeout"
                value={formData.sessionTimeout || "30"}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-purple-500"
              />
            </div>

          </div>
        )}

        {/* TAB 3: BILLING & FINANCE */}
        {activeTab === "finance" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <CreditCard size={16} className="text-emerald-500" />
              <span>Fee Structures & Invoice Validation Defaults</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Default Student Monthly Fee (₹)
                </label>
                <input
                  type="number"
                  name="defaultMonthlyFee"
                  value={formData.defaultMonthlyFee || "1500"}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Late Fee Penalty Rate (₹ / Day)
                </label>
                <input
                  type="number"
                  name="lateFeePerDay"
                  value={formData.lateFeePerDay || "50"}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Applicable Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate || "18"}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  name="invoicePrefix"
                  value={formData.invoicePrefix || "INV-2026-"}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Toggle Auto Approve */}
            <div className="flex items-start justify-between gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto-Approve Franchise Invoices</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Automatically approves fee receipt validations when franchise payment verification passes successfully.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("autoApproveFranchise")}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                  formData.autoApproveFranchise ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  formData.autoApproveFranchise ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: NOTIFICATIONS & ALERTS */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Bell size={16} className="text-blue-500" />
              <span>Automated Alert Channels & Triggers</span>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                Admin Notification Recipient Email
              </label>
              <input
                type="email"
                name="notificationEmail"
                value={formData.notificationEmail || "alerts@smartabacus.com"}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              
              <div className="flex items-start justify-between gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Email Inventory Low-Stock Alerts</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Sends automated email digests when any inventory item falls below minimum threshold limits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("emailAlerts")}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.emailAlerts ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.emailAlerts ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-6 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Fee Payment Due Reminders</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Dispatches automated in-app and email reminders to students 3 days before fee due dates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("feeReminders")}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.feeReminders ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.feeReminders ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-6 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">SMS & WhatsApp Urgent Notifications</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Enables SMS gateway integration for emergency broadcast messages to students and teachers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("smsAlerts")}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                    formData.smsAlerts ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    formData.smsAlerts ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: INVENTORY THRESHOLDS */}
        {activeTab === "inventory" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Package size={16} className="text-purple-500" />
              <span>Global Stock Thresholds & Restock Governance</span>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                Global Minimum Low-Stock Threshold Limit
              </label>
              <input
                type="number"
                min="1"
                max="500"
                name="lowStockThreshold"
                value={formData.lowStockThreshold || "15"}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono font-bold focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Items with stock quantity equal to or below this number trigger low-stock warning badges.
              </p>
            </div>

            <div className="flex items-start justify-between gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto Restock Supplier Alert Notifications</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Automatically generates restock request drafts when central admin stock breaches minimum limits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("autoRestockAlert")}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                  formData.autoRestockAlert ? "bg-purple-600" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  formData.autoRestockAlert ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Form Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 max-w-3xl">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            Cancel / Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white font-bold text-xs cursor-pointer shadow-md shadow-[#FF6B2B]/20"
          >
            {isSaving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>

      </form>
    </div>
  );
}
