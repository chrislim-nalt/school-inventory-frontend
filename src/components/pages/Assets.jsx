import { useEffect, useState } from "react";
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetSummary } from "../services/assetService";
import DownloadButton from "../DownloadButton";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedCondition, setSelectedCondition] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const [form, setForm] = useState({
    name: "",
    assetType: "FURNITURE",
    quantity: 1,
    condition: "Good condition",
    location: "Storage",
    responsiblePerson: "",
    dateReceived: new Date().toISOString().split('T')[0],
    unitPrice: 0,
    notes: "",
  });

  const assetTypes = [
    { value: "FURNITURE", label: "Furniture" },
    { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
    { value: "KITCHEN_EQUIPMENT", label: "Kitchen Equipment" },
    { value: "LAB_EQUIPMENT", label: "Lab Equipment" },
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "SPORTS_EQUIPMENT", label: "Sports Equipment" },
    { value: "LIVESTOCK", label: "Livestock" },
    { value: "BUILDING", label: "Building" },
    { value: "LAND", label: "Land" },
    { value: "OTHER", label: "Other" },
  ];

  const conditions = ["Good condition", "Damaged", "Defective", "Under repair", "New"];
  const locations = ["Kitchen", "Storage", "Laboratory", "Library", "Classroom", "Office", "Farm", "Other"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, summaryRes] = await Promise.all([
        getAssets(),
        getAssetSummary()
      ]);
      setAssets(assetsRes.data || []);
      setSummary(summaryRes.data);
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
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.responsiblePerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || asset.assetType === selectedType;
    const matchesCondition = selectedCondition === "ALL" || asset.condition === selectedCondition;
    return matchesSearch && matchesType && matchesCondition;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCondition]);

  const resetForm = () => {
    setForm({
      name: "",
      assetType: "FURNITURE",
      quantity: 1,
      condition: "Good condition",
      location: "Storage",
      responsiblePerson: "",
      dateReceived: new Date().toISOString().split('T')[0],
      unitPrice: 0,
      notes: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("ALL");
    setSelectedCondition("ALL");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError("Asset name is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Prepare data - convert types properly to avoid 500 error
    const submitData = {
      name: form.name.trim(),
      assetType: form.assetType,
      quantity: Number(form.quantity) || 1,
      condition: form.condition,
      location: form.location,
      responsiblePerson: form.responsiblePerson || null,
      dateReceived: form.dateReceived,
      unitPrice: Number(form.unitPrice) || 0,
      notes: form.notes || null,
    };
    
    try {
      if (editingId) {
        await updateAsset(editingId, submitData);
        setSuccess("Asset updated successfully!");
      } else {
        await createAsset(submitData);
        setSuccess("Asset created successfully!");
      }
      resetForm();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving asset:", error);
      setError(error.response?.data?.message || "Failed to save asset");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset) => {
    setForm({
      name: asset.name,
      assetType: asset.assetType || "FURNITURE",
      quantity: asset.quantity || 1,
      condition: asset.condition || "Good condition",
      location: asset.location || "Storage",
      responsiblePerson: asset.responsiblePerson || "",
      dateReceived: asset.dateReceived ? new Date(asset.dateReceived).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      unitPrice: asset.unitPrice || 0,
      notes: asset.notes || "",
    });
    setEditingId(asset._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setLoading(true);
      try {
        await deleteAsset(id);
        setSuccess("Asset deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting asset:", error);
        setError("Failed to delete asset");
        setLoading(false);
      }
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      "Good condition": "bg-emerald-100 text-emerald-700",
      "Damaged": "bg-rose-100 text-rose-700",
      "Defective": "bg-orange-100 text-orange-700",
      "Under repair": "bg-amber-100 text-amber-700",
      "New": "bg-blue-100 text-blue-700",
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

  // Prepare export data
  const exportData = filteredAssets.map(asset => ({
    name: asset.name,
    type: asset.assetType?.replace(/_/g, ' ') || "-",
    quantity: asset.quantity || 0,
    condition: asset.condition || "-",
    location: asset.location || "-",
    responsible: asset.responsiblePerson || "-",
    dateReceived: asset.dateReceived ? new Date(asset.dateReceived).toLocaleDateString() : "-",
    unitPrice: asset.unitPrice ? `${asset.unitPrice.toLocaleString()} RWF` : "-",
    totalValue: asset.unitPrice && asset.quantity ? `${(asset.unitPrice * asset.quantity).toLocaleString()} RWF` : "-"
  }));

  const exportColumns = [
    { key: "name", label: "Asset Name" },
    { key: "type", label: "Asset Type" },
    { key: "quantity", label: "Quantity" },
    { key: "condition", label: "Condition" },
    { key: "location", label: "Location" },
    { key: "responsible", label: "Responsible Person" },
    { key: "dateReceived", label: "Date Received" },
    { key: "unitPrice", label: "Unit Price" },
    { key: "totalValue", label: "Total Value" }
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                Assets Management
              </h1>
              <p className="text-slate-300 text-sm">
                Track equipment, furniture, livestock, and buildings
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
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Total Assets</p>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">{summary.total || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Good Condition</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">
                  {summary.byCondition?.find(c => c._id === "Good condition")?.count || 0}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">New Assets</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-400 mt-1">
                  {summary.byCondition?.find(c => c._id === "New")?.count || 0}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-xs">Needs Repair</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">
                  {(summary.byCondition?.find(c => c._id === "Damaged")?.count || 0) +
                   (summary.byCondition?.find(c => c._id === "Defective")?.count || 0) +
                   (summary.byCondition?.find(c => c._id === "Under repair")?.count || 0)}
                </p>
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
              placeholder="Search by name, location, or responsible person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="ALL">All Types</option>
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
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
        </div>
        
        {/* Filter Actions */}
        {(searchTerm || selectedType !== "ALL" || selectedCondition !== "ALL") && (
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
            <DownloadButton
              data={exportData}
              columns={exportColumns}
              title="G.S AGATEKO - Assets Report"
              filename="assets_export"
              variant="primary"
            />
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
          <div className="text-6xl mb-3 animate-float">🏗️</div>
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsible</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((asset, index) => (
                  <tr key={asset._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-medium text-slate-800 text-sm">{asset.name}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-slate-600 text-sm">{asset.assetType?.replace("_", " ") || "-"}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-slate-700">
                      {asset.quantity}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                      {asset.location}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                      {asset.responsiblePerson || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="e.g., Office Desk, Projector, Cow"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Type</label>
                <select
                  value={form.assetType}
                  onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible Person</label>
                <input
                  type="text"
                  value={form.responsiblePerson}
                  onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="Who is responsible for this asset?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date Received</label>
                <input
                  type="date"
                  value={form.dateReceived}
                  onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
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
                  {loading ? "Saving..." : (editingId ? "Update" : "Create")}
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