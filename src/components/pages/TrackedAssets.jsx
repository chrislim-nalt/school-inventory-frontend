import { useEffect, useState } from "react";
import { 
  getTrackedAssets, 
  createTrackedAsset, 
  updateTrackedAsset, 
  deleteTrackedAsset,
  assignAsset,
  returnAsset,
  getAssetStats
} from "../services/trackedAssetService";
import DownloadButton from "../DownloadButton";

export default function TrackedAssets() {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const [form, setForm] = useState({
    assetName: "",
    assetCode: "",
    serialNumber: "",
    condition: "Good",
  });

  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    location: "",
  });

  const conditions = ["Good", "Fair", "Poor", "Damaged", "Under Repair"];
  const statuses = ["Available", "Assigned"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, statsRes] = await Promise.all([
        getTrackedAssets(),
        getAssetStats()
      ]);
      setAssets(assetsRes.data || []);
      setStats(statsRes.data);
      setError("");
    } catch (error) {
      console.error("Error fetching assets:", error);
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = selectedCondition === "ALL" || asset.condition === selectedCondition;
    const matchesStatus = selectedStatus === "ALL" || asset.status === selectedStatus;
    return matchesSearch && matchesCondition && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCondition, selectedStatus]);

  const resetForm = () => {
    setForm({
      assetName: "",
      assetCode: "",
      serialNumber: "",
      condition: "Good",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCondition("ALL");
    setSelectedStatus("ALL");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.assetName || !form.assetCode || !form.serialNumber) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (editingId) {
        await updateTrackedAsset(editingId, form);
        setSuccess("Asset updated successfully!");
      } else {
        await createTrackedAsset(form);
        setSuccess("Asset added successfully!");
      }
      resetForm();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving asset:", error);
      setError(error.response?.data?.message || "Failed to save asset");
      setLoading(false);
    }
  };

  const handleAssign = async (id) => {
    if (!assignForm.assignedTo) {
      setError("Please enter who this asset is assigned to");
      return;
    }
    
    setLoading(true);
    try {
      await assignAsset(id, assignForm);
      setSuccess("Asset assigned successfully!");
      setShowAssignModal(null);
      setAssignForm({ assignedTo: "", location: "" });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to assign asset");
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm("Return this asset to inventory?")) {
      setLoading(true);
      try {
        await returnAsset(id);
        setSuccess("Asset returned successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Failed to return asset");
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setLoading(true);
      try {
        await deleteTrackedAsset(id);
        setSuccess("Asset deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Failed to delete asset");
        setLoading(false);
      }
    }
  };

  const handleEdit = (asset) => {
    setForm({
      assetName: asset.assetName,
      assetCode: asset.assetCode,
      serialNumber: asset.serialNumber,
      condition: asset.condition || "Good",
    });
    setEditingId(asset._id);
    setShowForm(true);
  };

  const getConditionColor = (condition) => {
    const colors = {
      "Good": "bg-emerald-100 text-emerald-700",
      "Fair": "bg-amber-100 text-amber-700",
      "Poor": "bg-orange-100 text-orange-700",
      "Damaged": "bg-rose-100 text-rose-700",
      "Under Repair": "bg-purple-100 text-purple-700",
    };
    return colors[condition] || "bg-slate-100 text-slate-700";
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                Asset Tracking
              </h1>
              <p className="text-slate-300 text-sm">
                Track computers, equipment, and other assets
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg text-sm"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add Asset
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Total Assets</p>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Available</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{stats.available || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Assigned</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">{stats.assigned || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Issues</p>
                <p className="text-2xl md:text-3xl font-bold text-rose-400 mt-1">{(stats.damaged || 0) + (stats.underRepair || 0)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, asset code, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="ALL">All Conditions</option>
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="ALL">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        {/* Filter Actions */}
        {(searchTerm || selectedCondition !== "ALL" || selectedStatus !== "ALL") && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Found {filteredAssets.length} asset(s)</span>
            <button onClick={resetFilters} className="text-xs text-indigo-600 hover:text-indigo-700">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Export Section */}
      {assets.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Export Assets</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DownloadButton
                data={filteredAssets.map(asset => ({
                  name: asset.assetName,
                  code: asset.assetCode,
                  serial: asset.serialNumber,
                  condition: asset.condition || "-",
                  status: asset.status || "-",
                  assignedTo: asset.assignedTo || "-",
                  location: asset.location || "-",
                  added: new Date(asset.createdAt).toLocaleDateString()
                }))}
                columns={[
                  { key: "name", label: "Asset Name" },
                  { key: "code", label: "Asset Code" },
                  { key: "serial", label: "Serial Number" },
                  { key: "condition", label: "Condition" },
                  { key: "status", label: "Status" },
                  { key: "assignedTo", label: "Assigned To" },
                  { key: "location", label: "Location" },
                  { key: "added", label: "Date Added" }
                ]}
                title="School Inventory - Tracked Assets Report"
                filename="tracked_assets_export"
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {filteredAssets.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} assets
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !showForm && assets.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
      ) : filteredAssets.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-3 animate-float">💻</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No assets found</h3>
          <p className="text-slate-500 text-sm mb-4">Get started by adding your first asset</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Asset
          </button>
        </div>
      ) : (
        /* Assets Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Asset Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Asset Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Serial Number</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((asset, index) => (
                  <tr key={asset._id} className="hover:bg-slate-50 transition-colors" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-medium text-slate-800 text-sm">{asset.assetName}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <code className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {asset.assetCode}
                      </code>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <code className="text-xs font-mono text-slate-500">{asset.serialNumber}</code>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${
                        asset.status === "Available" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                      {asset.assignedTo || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {asset.status === "Available" ? (
                          <button
                            onClick={() => setShowAssignModal(asset._id)}
                            className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
                          >
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReturn(asset._id)}
                            className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
                          >
                            Return
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(asset)} 
                          className="p-1 rounded hover:bg-indigo-50 text-indigo-600 text-sm transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(asset._id)} 
                          className="p-1 rounded hover:bg-rose-50 text-rose-500 text-sm transition-all"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Asset" : "Add New Asset"}</h2>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={form.assetName}
                  onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="e.g., Dell Laptop, HP Desktop"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Code</label>
                <input
                  type="text"
                  value={form.assetCode}
                  onChange={(e) => setForm({ ...form, assetCode: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="e.g., AST-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Manufacturer serial number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : (editingId ? "Update" : "Add")}
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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Assign Asset</h2>
              <button onClick={() => setShowAssignModal(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={assignForm.assignedTo}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Teacher name, Department..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={assignForm.location}
                  onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Computer Lab, Classroom 5..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAssign(showAssignModal)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(null)}
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