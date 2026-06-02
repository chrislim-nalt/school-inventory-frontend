import { useEffect, useState } from "react";
import { 
  getCleaningSupplies, 
  createCleaningSupply, 
  updateCleaningSupply, 
  deleteCleaningSupply,
  getLowStockSupplies,
  updateStock
} from "../services/cleaningSupplyService";
import DownloadButton from "../DownloadButton";

export default function CleaningSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [stockQuantity, setStockQuantity] = useState("");

  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    unit: "pcs",
    minStockLevel: 10,
    storageLocation: "Storage Room",
    responsiblePerson: "",
    lastRestockedDate: new Date().toISOString().split('T')[0],
    unitPrice: 0,
    supplier: "",
    notes: "",
  });

  const units = ["pcs", "kgs", "liters", "cartons", "pairs", "bottles", "packs", "l", "kg"];
  const locations = ["Storage Room", "Kitchen", "Cleaning Closet", "Janitor Room", "Main Office", "Classrooms"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliesRes, lowStockRes] = await Promise.all([
        getCleaningSupplies(),
        getLowStockSupplies()
      ]);
      
      let suppliesData = suppliesRes.data || [];
      
      // Apply search filter
      if (searchTerm) {
        suppliesData = suppliesData.filter(supply => 
          supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supply.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supply.responsiblePerson?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setSupplies(suppliesData);
      setLowStockCount(lowStockRes.data?.length || 0);
      setError("");
    } catch (error) {
      console.error("Error fetching supplies:", error);
      setError("Failed to load cleaning supplies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  // Filter supplies by location
  const filteredSupplies = selectedLocation === "ALL" 
    ? supplies 
    : supplies.filter(s => s.storageLocation === selectedLocation);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSupplies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, searchTerm]);

  const resetForm = () => {
    setForm({
      name: "",
      quantity: 0,
      unit: "pcs",
      minStockLevel: 10,
      storageLocation: "Storage Room",
      responsiblePerson: "",
      lastRestockedDate: new Date().toISOString().split('T')[0],
      unitPrice: 0,
      supplier: "",
      notes: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("ALL");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError("Supply name is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (editingId) {
        await updateCleaningSupply(editingId, form);
        setSuccess("Supply updated successfully!");
      } else {
        await createCleaningSupply(form);
        setSuccess("Supply added successfully!");
      }
      resetForm();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving supply:", error);
      setError(error.response?.data?.message || "Failed to save supply");
      setLoading(false);
    }
  };

  const handleEdit = (supply) => {
    setForm({
      name: supply.name,
      quantity: supply.quantity || 0,
      unit: supply.unit || "pcs",
      minStockLevel: supply.minStockLevel || 10,
      storageLocation: supply.storageLocation || "Storage Room",
      responsiblePerson: supply.responsiblePerson || "",
      lastRestockedDate: supply.lastRestockedDate ? new Date(supply.lastRestockedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      unitPrice: supply.unitPrice || 0,
      supplier: supply.supplier || "",
      notes: supply.notes || "",
    });
    setEditingId(supply._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this cleaning supply?")) {
      setLoading(true);
      try {
        await deleteCleaningSupply(id);
        setSuccess("Supply deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting supply:", error);
        setError("Failed to delete supply");
        setLoading(false);
      }
    }
  };

  const handleUpdateStock = async (id, currentQuantity) => {
    if (stockQuantity && !isNaN(parseInt(stockQuantity))) {
      setLoading(true);
      try {
        await updateStock(id, parseInt(stockQuantity));
        setSuccess("Stock updated successfully!");
        setShowStockModal(null);
        setStockQuantity("");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error updating stock:", error);
        setError("Failed to update stock");
        setLoading(false);
      }
    }
  };

  const getStatusInfo = (supply) => {
    if (supply.quantity <= 0) {
      return { label: "Out of Stock", color: "bg-rose-100 text-rose-700" };
    }
    if (supply.quantity <= supply.minStockLevel) {
      return { label: "Low Stock", color: "bg-amber-100 text-amber-700" };
    }
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-700" };
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Summary statistics
  const totalItems = filteredSupplies.length;
  const totalQuantity = filteredSupplies.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const lowStockItems = filteredSupplies.filter(s => s.quantity <= s.minStockLevel && s.quantity > 0).length;
  const outOfStock = filteredSupplies.filter(s => s.quantity <= 0).length;
  const totalValue = filteredSupplies.reduce((sum, s) => sum + ((s.unitPrice || 0) * (s.quantity || 0)), 0);

  // Prepare export data
  const exportData = filteredSupplies.map(s => ({
    name: s.name,
    quantity: s.quantity || 0,
    unit: s.unit || "-",
    minStockLevel: s.minStockLevel || "-",
    status: s.quantity <= 0 ? "Out of Stock" : (s.quantity <= s.minStockLevel ? "Low Stock" : "In Stock"),
    location: s.storageLocation || "-",
    responsiblePerson: s.responsiblePerson || "-",
    supplier: s.supplier || "-",
    unitPrice: s.unitPrice ? `${s.unitPrice.toLocaleString()} RWF` : "-",
    totalValue: s.unitPrice && s.quantity ? `${(s.unitPrice * s.quantity).toLocaleString()} RWF` : "-",
    lastRestocked: s.lastRestockedDate ? new Date(s.lastRestockedDate).toLocaleDateString() : "-"
  }));

  const exportColumns = [
    { key: "name", label: "Supply Name" },
    { key: "quantity", label: "Quantity" },
    { key: "unit", label: "Unit" },
    { key: "minStockLevel", label: "Min Stock Level" },
    { key: "status", label: "Status" },
    { key: "location", label: "Storage Location" },
    { key: "responsiblePerson", label: "Responsible Person" },
    { key: "supplier", label: "Supplier" },
    { key: "unitPrice", label: "Unit Price" },
    { key: "totalValue", label: "Total Value" },
    { key: "lastRestocked", label: "Last Restocked" }
  ];

  return (
    <div className="space-y-4">
      
      {/* Toast Messages */}
      {(success || error) && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in ${
          success ? "bg-emerald-500" : "bg-rose-500"
        } text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-sm`}>
          <span className="text-lg">{success ? "✓" : "⚠"}</span>
          <p className="font-medium">{success || error}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                Cleaning Supplies
              </h1>
              <p className="text-slate-300 text-sm">
                Manage hygiene products, cleaning materials, and janitorial supplies
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg text-sm"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add Supply
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Total Items</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{totalItems}</p>
              <p className="text-slate-400 text-xs mt-1">unique supplies</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Total Quantity</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{totalQuantity}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Total Value</p>
              <p className="text-xl md:text-2xl font-bold text-amber-400 mt-1">{totalValue.toLocaleString()} RWF</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Low Stock</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">{lowStockItems}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Out of Stock</p>
              <p className="text-2xl md:text-3xl font-bold text-rose-400 mt-1">{outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner for Low Stock */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Low Stock Alert</p>
              <p className="text-xs text-amber-700">{lowStockCount} item(s) are running low. Please restock soon.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, supplier, or responsible person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="ALL">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        
        {/* Filter Actions */}
        {(searchTerm || selectedLocation !== "ALL") && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Found {filteredSupplies.length} item(s)</span>
            <button onClick={resetFilters} className="text-xs text-indigo-600 hover:text-indigo-700">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Export Section */}
      {supplies.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Export Cleaning Supplies</h3>
            </div>
            <DownloadButton
              data={exportData}
              columns={exportColumns}
              title="School Inventory - Cleaning Supplies Report"
              filename="cleaning_supplies_export"
              variant="primary"
            />
          </div>
        </div>
      )}

      {/* Results Count */}
      {filteredSupplies.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSupplies.length)} of {filteredSupplies.length} items
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !showForm && supplies.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
      ) : filteredSupplies.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-3 animate-float">🧹</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No cleaning supplies found</h3>
          <p className="text-slate-500 text-sm mb-4">Get started by adding your first cleaning supply</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Supply
          </button>
        </div>
      ) : (
        /* Supplies Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((supply, index) => {
                  const status = getStatusInfo(supply);
                  const isLow = supply.quantity <= supply.minStockLevel && supply.quantity > 0;
                  
                  return (
                    <tr key={supply._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-medium text-slate-800 text-sm">{supply.name}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <span className={`font-semibold text-sm ${isLow ? 'text-amber-500' : supply.quantity <= 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                          {supply.quantity}
                        </span>
                        {isLow && <span className="ml-1 text-xs text-amber-500">(Low)</span>}
                        {supply.quantity <= 0 && <span className="ml-1 text-xs text-rose-500">(Out)</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                        {supply.unit}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-slate-600 text-sm">
                        {supply.unitPrice?.toLocaleString() || 0} RWF
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                        {supply.storageLocation}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                        {supply.supplier || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setShowStockModal(supply._id)}
                            className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
                            title="Update Stock"
                          >
                            Stock
                          </button>
                          <button 
                            onClick={() => handleEdit(supply)} 
                            className="p-1 rounded hover:bg-indigo-50 text-indigo-600 text-sm transition-all"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(supply._id)} 
                            className="p-1 rounded hover:bg-rose-50 text-rose-500 text-sm transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      currentPage === 1
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`w-7 h-7 rounded text-xs font-medium transition ${
                          currentPage === page
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                            : page === '...'
                            ? "text-slate-400 cursor-default"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      currentPage === totalPages
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">{editingId ? "Edit" : "Add"}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Supply" : "Add New Supply"}</h2>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supply Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="e.g., OMO, VIM, Bleach, Gloves"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Level</label>
                  <input
                    type="number"
                    value={form.minStockLevel}
                    onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 10 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Alert when below"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price (RWF)</label>
                  <input
                    type="number"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
                <select
                  value={form.storageLocation}
                  onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible Person</label>
                <input
                  type="text"
                  value={form.responsiblePerson}
                  onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Who manages this supply?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Restocked Date</label>
                <input
                  type="date"
                  value={form.lastRestockedDate}
                  onChange={(e) => setForm({ ...form, lastRestockedDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  rows="2"
                  placeholder="Additional information..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : (editingId ? "Update Supply" : "Add Supply")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStockModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Update Stock</h2>
              <button onClick={() => setShowStockModal(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Quantity</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Enter new quantity"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStock(showStockModal, null)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowStockModal(null)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}