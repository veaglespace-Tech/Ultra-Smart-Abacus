"use client";

import React, { useState, useMemo } from "react";
import { 
  Package, Search, Plus, Minus, AlertTriangle, CheckCircle, 
  Layers, ShoppingBag, ArrowDownUp, RefreshCw, X, Save, Download 
} from "lucide-react";

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([
    { id: "INV-KIT-01", name: "Abacus Starter Kit (Level 1)", category: "Kits", stock: 45, minRequired: 15, unitPrice: 350 },
    { id: "INV-BKP-02", name: "Level 2 Advanced Practice Book", category: "Books", stock: 8, minRequired: 20, unitPrice: 120 }, // Low Stock
    { id: "INV-CRT-03", name: "Official Graduation Certificates", category: "Stationery", stock: 120, minRequired: 30, unitPrice: 40 },
    { id: "INV-KIT-04", name: "Master Metal Abacus Tool", category: "Kits", stock: 3, minRequired: 5, unitPrice: 650 }, // Low Stock
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("Restock"); // Restock (+) or Distribute (-)

  // Filter Pipeline
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, filterCategory]);

  // Live Metrics (Low Stock Alert Engines)
  const metrics = useMemo(() => {
    return {
      totalItems: inventory.reduce((acc, item) => acc + item.stock, 0),
      lowStockCount: inventory.filter(item => item.stock < item.minRequired).length,
      categoriesCount: new Set(inventory.map(item => item.category)).size
    };
  }, [inventory]);

  const openAdjustmentModal = (item, type) => {
    setSelectedItem(item);
    setAdjustmentType(type);
    setAdjustmentQty("");
    setIsAdjustmentOpen(true);
  };

  const handleStockUpdate = (e) => {
    e.preventDefault();
    if (!selectedItem || !adjustmentQty) return;

    const qty = Number(adjustmentQty);
    setInventory(inventory.map(item => {
      if (item.id === selectedItem.id) {
        const finalStock = adjustmentType === "Restock" ? item.stock + qty : item.stock - qty;
        return { ...item, stock: Math.max(0, finalStock) };
      }
      return item;
    }));

    setIsAdjustmentOpen(false);
    setSelectedItem(null);
  };

  // 📥 Native Chrome CSV/Excel Export Engine
  const downloadInventoryCSV = () => {
    const headers = ["SKU Code", "Material Description", "Category", "Current Stock", "Safety Buffer", "Status"];
    
    const rows = filteredInventory.map(item => {
      const status = item.stock < item.minRequired ? "Low Stock Alert" : "In Stock Stable";
      return [
        item.id,
        `"${item.name}"`, // Wrapping spaces safely
        item.category,
        item.stock,
        item.minRequired,
        status
      ].join(",");
    });

    // \uFEFF ensures proper UTF-8 layout inside MS Excel
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Ledger_${filterCategory}_Export.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 text-[#2c3539] max-w-[1600px] mx-auto bg-[#fcfbfa] font-sans min-h-screen">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#1a202c]">Inventory & <span className="text-[#4a5d4e]">Material Ledger</span></h2>
          <p className="text-xs text-[#7a8475] mt-1">Track abacus learning tools, textbook dispatches, and certificate allocations.</p>
        </div>
        
        {/* Chrome-friendly Download Action */}
        <button 
          onClick={downloadInventoryCSV}
          className="px-4 py-2.5 bg-[#fcfbfa] hover:bg-[#f4f0e6] text-[#2c3539] font-bold rounded-xl border border-[#e2dcd0] text-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center shadow-sm"
        >
          <Download size={14} className="text-[#7a8475]" /> Download Inventory CSV
        </button>
      </div>

      {/* Stock Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#7a8475] font-bold">Total Units Logged</div>
            <div className="text-xl font-black text-[#1a202c] mt-1">{metrics.totalItems} Units</div>
          </div>
          <div className="p-2.5 bg-[#f4f0e6] text-[#4a5d4e] rounded-xl"><Package size={18} /></div>
        </div>
        
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-rose-700 font-bold">Low Stock Triggers</div>
            <div className="text-xl font-black text-rose-700 mt-1">{metrics.lowStockCount} Items Critical</div>
          </div>
          <div className="p-2.5 bg-rose-100/60 border border-rose-200 text-rose-700 rounded-xl"><AlertTriangle size={18} /></div>
        </div>
        
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-700 font-bold">Unique Profiles</div>
            <div className="text-xl font-black text-blue-900 mt-1">{metrics.categoriesCount} Material Classes</div>
          </div>
          <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl"><Layers size={18} /></div>
        </div>
      </div>

      {/* Roster Search Filters */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 text-[#7a8475]" size={14} />
          <input type="text" placeholder="Search Material Name, SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#fcfbfa] text-xs text-[#1a202c] rounded-xl pl-9 pr-4 py-2.5 border border-[#e2dcd0] focus:outline-none focus:border-[#4a5d4e] placeholder-[#7a8475]/60" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-[#fcfbfa] px-3 py-2.5 rounded-xl border border-[#e2dcd0] text-xs text-[#2c3539] font-medium focus:outline-none w-full sm:w-43 sm:ml-auto focus:border-[#4a5d4e]">
          <option value="All">All Categories</option>
          <option value="Kits">Abacus Tool Kits</option>
          <option value="Books">Textbooks & Workbooks</option>
          <option value="Stationery">Stationery & Certificates</option>
        </select>
      </div>

      {/* Main Core Ledger Table */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6]/60 text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e] font-mono">
                <th className="py-4 px-6">SKU Code</th>
                <th className="py-4 px-6">Material Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 font-mono text-center">Current Stock</th>
                <th className="py-4 px-6 font-mono text-center">Safety Buffer</th>
                <th className="py-4 px-6 text-center">Status Index</th>
                <th className="py-4 px-6 text-center">Stock Adjustment Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/60 text-[#2c3539] font-medium">
              {filteredInventory.map((item) => {
                const isLow = item.stock < item.minRequired;
                return (
                  <tr key={item.id} className="hover:bg-[#f4f0e6]/30 transition-colors group">
                    <td className="py-4 px-6 font-mono text-[#4a5d4e] font-bold">{item.id}</td>
                    <td className="py-4 px-6 font-black text-[#1a202c]">{item.name}</td>
                    <td className="py-4 px-6"><span className="px-2 py-0.5 bg-[#f4f0e6] text-[#4a5d4e] rounded font-mono text-[10px] border border-[#e2dcd0]">{item.category}</span></td>
                    <td className={`py-4 px-6 font-mono text-center font-black text-sm ${isLow ? "text-rose-700" : "text-[#1a202c]"}`}>{item.stock}</td>
                    <td className="py-4 px-6 font-mono text-center text-[#7a8475]">{item.minRequired}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isLow ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>{isLow ? "Low Stock Alert" : "In Stock Stable"}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openAdjustmentModal(item, "Restock")} className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1">
                          <Plus size={11} /> Restock
                        </button>
                        <button onClick={() => openAdjustmentModal(item, "Distribute")} className="px-2 py-1 bg-[#fcfbfa] hover:bg-rose-50 border border-[#e2dcd0] hover:border-rose-200 text-[#7a8475] hover:text-rose-700 rounded-lg font-bold text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1">
                          <Minus size={11} /> Issue/Use
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

      {/* Stock Adjustment Popup Modal */}
      {isAdjustmentOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <button onClick={() => { setIsAdjustmentOpen(false); setSelectedItem(null); }} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={16} /></button>
            <h3 className="text-xs font-black text-[#1a202c] mb-4 uppercase font-mono tracking-wider border-b border-[#e2dcd0] pb-2">
              {adjustmentType === "Restock" ? "Stock Replenishment Pipeline" : "Material Disbursement Entry"}
            </h3>
            
            <form onSubmit={handleStockUpdate} className="space-y-4 text-xs">
              <div className="bg-[#f4f0e6]/60 p-3 rounded-xl border border-[#e2dcd0] font-mono">
                <div className="text-[10px] text-[#7a8475] uppercase font-bold">Item Selected</div>
                <div className="font-bold text-[#1a202c] mt-0.5">{selectedItem.name}</div>
                <div className="text-[10px] text-[#2c3539] mt-1 font-semibold">Current Balance: <span className="text-[#4a5d4e] font-bold">{selectedItem.stock} units</span></div>
              </div>

              <div>
                <label className="block text-[#4a5d4e] mb-1.5 font-bold">
                  {adjustmentType === "Restock" ? "Quantity to Add (+)" : "Quantity Distributed (-)"}
                </label>
                <input type="number" required min="1" placeholder="e.g. 10" value={adjustmentQty} onChange={(e) => setAdjustmentQty(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none focus:border-[#4a5d4e]" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsAdjustmentOpen(false); setSelectedItem(null); }} className="px-4 py-2 rounded-xl bg-[#fcfbfa] text-[#7a8475] border border-[#e2dcd0] cursor-pointer hover:text-[#1a202c] transition-colors font-medium">Cancel</button>
                <button type="submit" className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold cursor-pointer transition-all shadow-sm ${adjustmentType === 'Restock' ? 'bg-[#4a5d4e] hover:bg-[#3d4d40]' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  <Save size={14} /><span>Commit Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}