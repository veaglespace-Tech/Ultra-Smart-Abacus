"use client";

import React from "react";
import { useAdminData } from "../AdminContext";

export default function InventoryPage() {
  const { inventory, adjustStock } = useAdminData();

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Academy Materials Inventory</h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light mt-0.5">Track student kits, workbooks, bags, and adjust active inventory levels.</p>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 tracking-wider text-[9px] font-bold uppercase">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4 font-mono text-center">Unit Cost ($)</th>
                <th className="px-6 py-4 font-mono text-center">Stock Level</th>
                <th className="px-6 py-4 text-center">Alert Limit</th>
                <th className="px-6 py-4">Status Alert</th>
                <th className="px-6 py-4 text-right">Replenish Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {inventory.map((item) => {
                const isLow = item.stock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{item.sku}</td>
                    <td className="px-6 py-4 font-mono text-center text-slate-700 dark:text-slate-300">{item.cost}</td>
                    <td className="px-6 py-4 font-mono text-center font-extrabold text-slate-900 dark:text-white text-sm">{item.stock}</td>
                    <td className="px-6 py-4 font-mono text-center text-slate-500">{item.minThreshold}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Critically Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => adjustStock(item.id, -10)}
                          className="w-7 h-7 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold active:scale-95 transition-all cursor-pointer"
                          title="Consume 10 units"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 10)}
                          className="w-7 h-7 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold active:scale-95 transition-all cursor-pointer"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 100)}
                          className="px-2.5 h-7 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 font-extrabold active:scale-95 transition-all cursor-pointer"
                          title="Bulk load 100 units"
                        >
                          +100 Bulk
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
