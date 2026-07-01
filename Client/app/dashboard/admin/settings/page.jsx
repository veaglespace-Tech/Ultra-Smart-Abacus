"use client";

import React from "react";
import { useAdminData } from "../AdminContext";

export default function SettingsPage() {
  const { settings, setSettings } = useAdminData();

  return (
    <div className="space-y-6">
      
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">Academy System Settings</h3>
        <p className="text-[10px] text-slate-400 font-light mt-0.5">Configure feature flags, user sign-up capabilities, and alert setups.</p>
      </div>

      {/* Toggles */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md max-w-xl space-y-6">
        
        {[
          { key: "allowPublicRegister", title: "Allow Public Account Registration", description: "If enabled, anyone can load the sign-up page and register a profile. Kept turned off as recommended.", type: "danger" },
          { key: "maintenanceMode", title: "System Maintenance Mode", description: "Blocks access to teachers and franchises, rendering a maintenance placeholder screen.", type: "danger" },
          { key: "emailAlerts", title: "Email Logs and Alerts", description: "Dispatches logs automatically when inventory levels breach minimum limits.", type: "safe" },
          { key: "autoApproveFranchise", title: "Auto-Approve Franchise Invoices", description: "Automatically completes registration steps when fee receipt validations pass.", type: "safe" }
        ].map((toggle) => (
          <div key={toggle.key} className="flex items-start justify-between gap-6 pb-5 border-b border-white/5 last:border-b-0 last:pb-0">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">{toggle.title}</h4>
              <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-relaxed">{toggle.description}</p>
            </div>

            <button
              onClick={() => {
                // Alert user when trying to turn on public signup to preserve safety recommendations
                if (toggle.key === "allowPublicRegister" && !settings.allowPublicRegister) {
                  const confirmTurnOn = confirm("WARNING: Re-enabling public registration bypasses the administrative check recommended in the early development phase. Do you want to continue?");
                  if (!confirmTurnOn) return;
                }
                
                setSettings({
                  ...settings,
                  [toggle.key]: !settings[toggle.key]
                });
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                settings[toggle.key]
                  ? toggle.type === "danger" ? "bg-rose-500" : "bg-blue-500"
                  : "bg-slate-800 border border-white/5"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                settings[toggle.key] ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        ))}

      </div>

    </div>
  );
}
