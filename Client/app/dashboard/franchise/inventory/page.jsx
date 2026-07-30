"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Package, Search, AlertTriangle, CheckCircle, 
  Layers, History, Download, Filter, ShieldCheck 
} from "lucide-react";
import { 
  fetchInventory, 
  fetchHistory,
  clearMessages
} from "@/store/inventorySlice";

export default function FranchiseInventoryManagement() {
  const dispatch = useDispatch();
  const { items, history, loading, error, successMessage } = useSelector(state => state.inventory);

  const [activeTab, setActiveTab] = useState("myStock"); // myStock, history
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchHistory());
  }, [dispatch]);

  // Dynamic Metrics
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const lowStockCount = items.filter(item => item.quantity <= item.minimumStock).length;
    const totalTransfers = history.length;

    return { totalItems, totalStock, lowStockCount, totalTransfers };
  }, [items, history]);

  // Filtered Franchise Stock
  const filteredStock = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  // CSV Export Engine
  const exportFranchiseStockCSV = () => {
    const headers = ["Item Name", "SKU", "Category", "Quantity Available", "Min Threshold", "Unit Price (₹)", "Status"];
    const rows = filteredStock.map(item => [
      `"${item.itemName.replace(/"/g, '""')}"`,
      item.sku || "N/A",
      item.category || "General",
      item.quantity,
      item.minimumStock,
      item.unitPrice,
      item.status
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Franchise_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">FRANCHISE INVENTORY & STOCK HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">
            Monitor assigned physical kits, workbooks, and study material stock dispatched from Central Admin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportFranchiseStockCSV}
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export My Stock CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Assigned Items</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalItems}</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-xl"><Package size={20} /></div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Total Stock Units</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.totalStock.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl"><Layers size={20} /></div>
        </div>

        <div className={`bg-white dark:bg-slate-900 border ${metrics.lowStockCount > 0 ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-4 flex items-center justify-between shadow-sm`}>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 font-bold">Low Stock Warning</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.lowStockCount}</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl"><AlertTriangle size={20} /></div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">Inbound Transfers</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{metrics.totalTransfers}</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-xl"><History size={20} /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("myStock")}
          className={`pb-3 transition-all cursor-pointer border-b-2 ${
            activeTab === "myStock"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          My Assigned Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <History size={13} />
          <span>Inbound Transfer Audit Logs ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: MY INVENTORY */}
      {activeTab === "myStock" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assigned stock by name or SKU..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter size={13} />
                <span>Category:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Study Material">Study Material</option>
                <option value="Abacus Kit">Abacus Kit</option>
                <option value="Workbooks">Workbooks</option>
                <option value="Merchandise">Merchandise</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="px-6 py-4">Item Name & SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Assigned Stock</th>
                    <th className="px-6 py-4 text-center">Min Threshold</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">Loading assigned inventory...</td>
                    </tr>
                  ) : filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No assigned inventory items found. Central Admin can dispatch stock to your franchise.
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const isLow = item.quantity <= item.minimumStock;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.itemName}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.sku || "NO-SKU"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                              {item.category || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-mono font-bold text-sm ${isLow ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-900 dark:text-white'}`}>
                              {item.quantity} units
                            </span>
                            {isLow && <span className="block text-[9px] text-amber-500 font-bold">LOW STOCK</span>}
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-slate-500">{item.minimumStock}</td>
                          <td className="px-6 py-4 text-right font-mono font-semibold">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                              {item.status || "ACTIVE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND TRANSFER AUDIT LOGS */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <History size={16} />
              <span>Inbound Stock Received Audit Log ({history.length})</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-6 py-4">Transfer Ref</th>
                  <th className="px-6 py-4">Inventory Item</th>
                  <th className="px-6 py-4 text-center">Quantity Received</th>
                  <th className="px-6 py-4">Dispatched By Admin</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                      No inbound stock transfers received yet.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">TR-{record.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {record.inventory?.itemName || "Inventory Item"}
                        <span className="block font-mono text-[10px] text-slate-400">{record.inventory?.sku}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{record.quantity} units
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.user?.name || "Central Admin"}</td>
                      <td className="px-6 py-4 text-slate-500">{record.remarks || "—"}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}