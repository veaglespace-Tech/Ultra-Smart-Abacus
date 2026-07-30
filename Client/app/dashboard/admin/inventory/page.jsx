"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Package, Search, Plus, AlertTriangle, CheckCircle, 
  Layers, ArrowDownUp, RefreshCw, X, Save, Download, 
  Send, History, ShieldAlert, Edit, Trash2, Filter
} from "lucide-react";
import { 
  fetchInventory, 
  createInventory, 
  updateInventory, 
  deleteInventory, 
  distributeInventory, 
  fetchLowStock, 
  fetchHistory,
  clearMessages
} from "@/store/inventorySlice";
import { api } from "@/services/api";

export default function AdminInventoryManagement() {
  const dispatch = useDispatch();
  const { items, lowStockItems, history, loading, error, successMessage } = useSelector(state => state.inventory);

  const [activeTab, setActiveTab] = useState("roster"); // roster, lowStock, distribution, history
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Franchises list for distribution & filter
  const [franchises, setFranchises] = useState([]);
  const [franchisesLoading, setFranchisesLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedDistributeItem, setSelectedDistributeItem] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Study Material",
    sku: "",
    description: "",
    quantity: 100,
    minimumStock: 15,
    unitPrice: 250,
    status: "ACTIVE",
    franchiseId: ""
  });

  const [distributeData, setDistributeData] = useState({
    inventoryId: "",
    franchiseId: "",
    quantity: 10,
    remarks: ""
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchLowStock());
    dispatch(fetchHistory());

    const loadFranchises = async () => {
      setFranchisesLoading(true);
      try {
        const res = await api.admin.getFranchises();
        const list = res.franchises || res.data || (Array.isArray(res) ? res : []);
        setFranchises(list);
      } catch (err) {
        console.warn("Failed fetching franchises:", err);
      } finally {
        setFranchisesLoading(false);
      }
    };
    loadFranchises();
  }, [dispatch]);

  // Flash message clear
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const lowStockCount = items.filter(item => item.quantity <= item.minimumStock).length;
    const activeCount = items.filter(item => item.status === "ACTIVE").length;
    const totalTransfers = history.length;

    return { totalItems, totalStock, lowStockCount, activeCount, totalTransfers };
  }, [items, history]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      itemName: "",
      category: "Study Material",
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      description: "",
      quantity: 100,
      minimumStock: 15,
      unitPrice: 250,
      price: 250,
      status: "ACTIVE",
      franchiseId: ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category || "Study Material",
      sku: item.sku || "",
      description: item.description || "",
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      unitPrice: item.unitPrice || item.price || 0,
      price: item.unitPrice || item.price || 0,
      status: item.status || "ACTIVE",
      franchiseId: item.franchiseId || ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenDistributeModal = (item = null) => {
    const targetItem = item || (items.length > 0 ? items[0] : null);
    setSelectedDistributeItem(targetItem);
    setDistributeData({
      inventoryId: targetItem ? targetItem.id : "",
      franchiseId: franchises.length > 0 ? franchises[0].id : "",
      quantity: 10,
      remarks: "Central Admin Distribution"
    });
    setIsDistributeModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (editingItem) {
      await dispatch(updateInventory({ id: editingItem.id, data: formData }));
    } else {
      await dispatch(createInventory(formData));
    }
    setIsAddModalOpen(false);
    dispatch(fetchLowStock());
  };

  const handleDeleteItem = async (id, name) => {
    if (confirm(`Are you sure you want to delete '${name}'?`)) {
      await dispatch(deleteInventory(id));
      dispatch(fetchLowStock());
    }
  };

  const handleSubmitDistribution = async (e) => {
    e.preventDefault();
    const payload = {
      inventoryId: Number(distributeData.inventoryId),
      franchiseId: Number(distributeData.franchiseId),
      quantity: Number(distributeData.quantity),
      remarks: distributeData.remarks
    };

    const res = await dispatch(distributeInventory(payload));
    if (!res.error) {
      setIsDistributeModalOpen(false);
      dispatch(fetchInventory());
      dispatch(fetchLowStock());
      dispatch(fetchHistory());
    }
  };

  // CSV Export Engine
  const exportStockCSV = () => {
    const headers = ["Item Name", "SKU", "Category", "Quantity", "Min Stock", "Unit Price (₹)", "Total Value (₹)", "Status", "Owner/Franchise"];
    const rows = filteredRoster.map(item => [
      `"${item.itemName.replace(/"/g, '""')}"`,
      item.sku || "N/A",
      item.category || "General",
      item.quantity,
      item.minimumStock,
      item.unitPrice,
      (item.quantity * item.unitPrice).toFixed(2),
      item.status,
      item.franchise ? `"${item.franchise.name.replace(/"/g, '""')}"` : "Central Admin Stock"
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Inventory_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHistoryCSV = () => {
    const headers = ["Transfer ID", "Item Name", "SKU", "Recipient Franchise", "Quantity Transferred", "Transferred By", "Remarks", "Date"];
    const rows = history.map(h => [
      `TR-${h.id}`,
      `"${(h.inventory?.itemName || 'Item').replace(/"/g, '""')}"`,
      h.inventory?.sku || 'N/A',
      `"${(h.franchise?.name || 'Franchise').replace(/"/g, '""')}"`,
      h.quantity,
      `"${(h.user?.name || 'Admin').replace(/"/g, '""')}"`,
      `"${(h.remarks || '').replace(/"/g, '""')}"`,
      new Date(h.createdAt).toISOString().split('T')[0]
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Stock_Transfers_Audit_${new Date().toISOString().split('T')[0]}.csv`;
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
            <span className="gradient-text">INVENTORY & STOCK DISTRIBUTION HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">
            Manage study material SKUs, dispatch stock to regional franchises, monitor threshold alerts, and audit transfer logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportStockCSV}
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export Stock CSV</span>
          </button>
          <button
            onClick={() => handleOpenDistributeModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <Send size={14} />
            <span>Distribute Stock</span>
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/20"
          >
            <Plus size={14} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Message Notifications */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-inner flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300 shadow-inner flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Total SKUs</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalItems}</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-xl"><Package size={20} /></div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Total Physical Units</div>
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
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">Stock Transfers</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{metrics.totalTransfers}</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-xl"><ArrowDownUp size={20} /></div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-teal-600 dark:text-teal-400 font-bold">Active Catalog</div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{metrics.activeCount}</div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 text-teal-600 rounded-xl"><CheckCircle size={20} /></div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 transition-all cursor-pointer border-b-2 ${
            activeTab === "roster"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Full Inventory Catalog ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("lowStock")}
          className={`pb-3 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === "lowStock"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <AlertTriangle size={13} />
          <span>Low Stock Thresholds ({metrics.lowStockCount})</span>
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
          <span>Stock Transfer Audit Log ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: FULL INVENTORY ROSTER & FILTERS */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or description..."
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="px-6 py-4">Item & SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Available Stock</th>
                    <th className="px-6 py-4 text-center">Min Threshold</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Total Value</th>
                    <th className="px-6 py-4 text-center">Stock Scope</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">Loading inventory catalog...</td>
                    </tr>
                  ) : filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        No inventory items found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((item) => {
                      const isLow = item.quantity <= item.minimumStock;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
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
                              {item.quantity}
                            </span>
                            {isLow && <span className="block text-[9px] text-amber-500 font-bold">LOW STOCK</span>}
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-slate-500">{item.minimumStock}</td>
                          <td className="px-6 py-4 text-right font-mono font-semibold">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.franchise ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {item.franchise.name}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Admin Main Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === "ACTIVE" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenDistributeModal(item)}
                                title="Transfer to Franchise"
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 transition-all cursor-pointer"
                              >
                                <Send size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Edit Item"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.itemName)}
                                title="Delete Item"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
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

      {/* TAB 2: LOW STOCK WARNING ALERTS */}
      {activeTab === "lowStock" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>Items Below Minimum Threshold Alert ({lowStockItems.length})</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-center">Current Quantity</th>
                  <th className="px-6 py-4 text-center">Minimum Threshold</th>
                  <th className="px-6 py-4 text-center">Shortfall</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                      All inventory stock levels are healthy! No low stock warnings.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.itemName}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{item.sku || "N/A"}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-center font-mono text-slate-500">{item.minimumStock}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-rose-600">
                        -{Math.max(0, item.minimumStock - item.quantity)} units
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Restock Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER AUDIT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <History size={16} />
              <span>Stock Transfer Audit Log ({history.length})</span>
            </div>
            <button
              onClick={exportHistoryCSV}
              className="bg-white hover:bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export History CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-6 py-4">Transfer Ref</th>
                  <th className="px-6 py-4">Inventory Item</th>
                  <th className="px-6 py-4">Recipient Franchise</th>
                  <th className="px-6 py-4 text-center">Transferred Quantity</th>
                  <th className="px-6 py-4">Dispatched By</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-semibold">
                      No stock transfers recorded yet.
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
                      <td className="px-6 py-4 font-semibold text-purple-600 dark:text-purple-400">
                        {record.franchise?.name || "Franchise"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{record.quantity} units
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.user?.name || "Admin"}</td>
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

      {/* MODAL 1: ADD / EDIT INVENTORY ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Package size={16} className="text-orange-500" />
                <span>{editingItem ? "Edit Inventory Item" : "Create New Inventory Item"}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g. Abacus Level 1 Workbook"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Study Material">Study Material</option>
                    <option value="Abacus Kit">Abacus Kit</option>
                    <option value="Workbooks">Workbooks</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-10492"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value, price: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details or level specifications..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer transition-all shadow-md shadow-orange-500/20"
                >
                  {editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STOCK DISTRIBUTION TO FRANCHISE */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-2">
                <Send size={16} />
                <span>Distribute Stock to Franchise</span>
              </h3>
              <button 
                onClick={() => setIsDistributeModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDistribution} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Select Inventory Item *</label>
                <select
                  required
                  value={distributeData.inventoryId}
                  onChange={(e) => {
                    const found = items.find(i => Number(i.id) === Number(e.target.value));
                    setSelectedDistributeItem(found);
                    setDistributeData({ ...distributeData, inventoryId: e.target.value });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none cursor-pointer font-bold"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} (Available: {item.quantity} units)
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistributeItem && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl text-purple-900 dark:text-purple-200 text-[11px] font-semibold flex justify-between items-center">
                  <span>Available Admin Stock:</span>
                  <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                    {selectedDistributeItem.quantity} units
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Select Target Franchise *</label>
                <select
                  required
                  value={distributeData.franchiseId}
                  onChange={(e) => setDistributeData({ ...distributeData, franchiseId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none cursor-pointer font-bold"
                >
                  <option value="">-- Choose Target Franchise --</option>
                  {franchises.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.address || 'Branch'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Quantity to Transfer *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedDistributeItem ? selectedDistributeItem.quantity : 9999}
                  required
                  value={distributeData.quantity}
                  onChange={(e) => setDistributeData({ ...distributeData, quantity: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold text-sm focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">Transfer Remarks / Reference</label>
                <input
                  type="text"
                  value={distributeData.remarks}
                  onChange={(e) => setDistributeData({ ...distributeData, remarks: e.target.value })}
                  placeholder="e.g. Initial Term Batch Allocation"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer transition-all shadow-md shadow-purple-600/20"
                >
                  Dispatch Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
