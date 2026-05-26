import { useEffect, useState } from "react";
import { getItems } from "../services/itemService";
import { getCategories } from "../services/categoryService";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../services/stockService";

export default function Stock() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterItem, setFilterItem] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  
  // For category-based item selection
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredItemsByCategory, setFilteredItemsByCategory] = useState([]);

  const [form, setForm] = useState({
    item: "",
    type: "IN",
    quantity: "",
    date: new Date().toISOString().split('T')[0],
    reference: "",
    purpose: "",
    borrowerName: "",
    borrowerDepartment: "Classroom",
    borrowedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemRes, transRes, catRes] = await Promise.all([
        getItems(),
        getTransactions(),
        getCategories()
      ]);
      setItems(itemRes.data || []);
      setCategories(catRes.data || []);
      
      let transactionsData = transRes.data || [];
      if (filterItem) {
        transactionsData = transactionsData.filter(t => t.item?._id === filterItem);
      }
      if (filterType !== "ALL") {
        transactionsData = transactionsData.filter(t => t.type === filterType);
      }
      if (filterCategory) {
        // Filter transactions by category
        transactionsData = transactionsData.filter(t => t.item?.category?._id === filterCategory);
      }
      setTransactions(transactionsData);
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Update filtered items when category or items change
  useEffect(() => {
    if (selectedCategory) {
      const filtered = items.filter(item => item.category?._id === selectedCategory);
      setFilteredItemsByCategory(filtered);
    } else {
      setFilteredItemsByCategory([]);
    }
    // Reset selected item when category changes
    setForm(prev => ({ ...prev, item: "" }));
  }, [selectedCategory, items]);

  useEffect(() => {
    fetchData();
  }, [filterItem, filterType, filterCategory]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterItem, filterType, filterCategory]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const resetFilters = () => {
    setFilterItem("");
    setFilterType("ALL");
    setFilterCategory("");
  };

  const resetForm = () => {
    setSelectedCategory("");
    setFilteredItemsByCategory([]);
    setForm({
      item: "",
      type: "IN",
      quantity: "",
      date: new Date().toISOString().split('T')[0],
      reference: "",
      purpose: "",
      borrowerName: "",
      borrowerDepartment: "Classroom",
      borrowedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.item) {
      setError("Please select an item");
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (form.type === "BORROW" && !form.borrowerName) {
      setError("Please enter borrower name for borrow transaction");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const submitData = {
        item: form.item,
        type: form.type,
        quantity: form.quantity,
        date: form.type === "BORROW" ? form.borrowedDate : form.date,
        reference: form.reference,
        purpose: form.purpose,
      };
      
      if (form.type === "BORROW") {
        submitData.borrowerName = form.borrowerName;
        submitData.borrowerDepartment = form.borrowerDepartment;
        submitData.expectedReturnDate = form.expectedReturnDate;
      }
      
      if (editingId) {
        await updateTransaction(editingId, submitData);
        setSuccess("Transaction updated successfully!");
      } else {
        await createTransaction(submitData);
        setSuccess("Transaction added successfully!");
      }
      resetForm();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving transaction:", error);
      setError(error.response?.data?.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    const itemCategory = transaction.item?.category?._id;
    if (itemCategory) {
      setSelectedCategory(itemCategory);
    }
    setForm({
      item: transaction.item?._id,
      type: transaction.type,
      quantity: transaction.quantity,
      date: new Date(transaction.date).toISOString().split('T')[0],
      reference: transaction.reference || "",
      purpose: transaction.purpose || "",
      borrowerName: transaction.borrowerName || "",
      borrowerDepartment: transaction.borrowerDepartment || "Classroom",
      borrowedDate: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedReturnDate: transaction.expectedReturnDate 
        ? new Date(transaction.expectedReturnDate).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setEditingId(transaction._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setLoading(true);
      try {
        await deleteTransaction(id);
        setSuccess("Transaction deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Failed to delete transaction");
        setLoading(false);
      }
    }
  };

  const getCurrentStock = (itemId) => {
    const item = items.find(i => i._id === itemId);
    return item?.currentQuantity || 0;
  };

  const getItemDetails = (itemId) => {
    return items.find(i => i._id === itemId);
  };

  const getSummaryStats = () => {
    let totalIn = 0, totalOut = 0, totalBorrow = 0, totalReturn = 0;
    transactions.forEach(t => {
      if (t.type === "IN") totalIn += t.quantity;
      else if (t.type === "OUT") totalOut += t.quantity;
      else if (t.type === "BORROW") totalBorrow += t.quantity;
      else if (t.type === "RETURN") totalReturn += t.quantity;
    });
    return { totalIn, totalOut, totalBorrow, totalReturn, 
      balance: totalIn - totalOut - totalBorrow + totalReturn };
  };

  const stats = getSummaryStats();

  const getTransactionIcon = (type) => {
    switch(type) {
      case "IN": return "📥";
      case "OUT": return "📤";
      case "BORROW": return "📋";
      case "RETURN": return "🔄";
      default: return "📦";
    }
  };

  const getTransactionColor = (type) => {
    switch(type) {
      case "IN": return "bg-emerald-100 text-emerald-700";
      case "OUT": return "bg-rose-100 text-rose-700";
      case "BORROW": return "bg-amber-100 text-amber-700";
      case "RETURN": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getTransactionGradient = (type) => {
    switch(type) {
      case "IN": return "from-emerald-500 to-emerald-600";
      case "OUT": return "from-rose-500 to-rose-600";
      case "BORROW": return "from-amber-500 to-amber-600";
      case "RETURN": return "from-blue-500 to-blue-600";
      default: return "from-slate-500 to-slate-600";
    }
  };

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
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                📦 Stock Management
              </h1>
              <p className="text-slate-300 text-sm">
                Track inventory: IN, OUT, BORROW, RETURN
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg text-sm"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add Transaction
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">📥 Stock IN</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{stats.totalIn}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">📤 Stock OUT</p>
              <p className="text-2xl md:text-3xl font-bold text-rose-400 mt-1">{stats.totalOut}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">📋 Borrowed</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">{stats.totalBorrow}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">🔄 Returned</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-400 mt-1">{stats.totalReturn}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">⚖️ Net Balance</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-400 mt-1">{stats.balance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Updated with Category Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">📁 Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            >
              <option value="">📂 All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">🔍 Filter by Item</label>
            <select
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              disabled={!filterCategory}
            >
              <option value="">📦 All Items</option>
              {items
                .filter(item => !filterCategory || item.category?._id === filterCategory)
                .map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name} (Stock: {getCurrentStock(i._id)} {i.unit})
                  </option>
                ))}
            </select>
            {!filterCategory && (
              <p className="text-xs text-amber-500 mt-1">⚠️ Select a category first to filter items</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">🏷️ Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            >
              <option value="ALL">📋 All Types</option>
              <option value="IN">📥 Stock IN</option>
              <option value="OUT">📤 Stock OUT</option>
              <option value="BORROW">📋 Borrow</option>
              <option value="RETURN">🔄 Return</option>
            </select>
          </div>
        </div>
        
        {(filterCategory || filterItem || filterType !== "ALL") && (
          <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              ✕ Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, transactions.length)} of {transactions.length} transactions
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !showForm && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-3 animate-float">📦</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No transactions yet</h3>
          <p className="text-slate-500 text-sm mb-4">Get started by adding your first stock transaction</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            ✨ Add Transaction
          </button>
        </div>
      ) : (
        /* Transactions Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">📅 Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">📁 Category</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">📦 Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">🏷️ Type</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">🔢 Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">👤 Borrower</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">🎯 Purpose</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">📄 Reference</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-xs">
                      📅 {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {t.item?.category?.icon || "📦"} {t.item?.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-sm">{t.item?.name}</span>
                        <span className="text-xs text-slate-400">{t.item?.location} • {t.item?.unit}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${getTransactionColor(t.type)}`}>
                        {getTransactionIcon(t.type)} {t.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-slate-700">
                      {t.quantity}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-xs">
                      {t.borrowerName || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {t.purpose ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          🎯 {t.purpose}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-400 text-xs">
                      {t.reference || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(t)} className="p-1 rounded hover:bg-indigo-50 text-indigo-600 text-sm transition-all" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(t._id)} className="p-1 rounded hover:bg-rose-50 text-rose-500 text-sm transition-all" title="Delete">🗑️</button>
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
                    className={`px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      currentPage === 1
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    ◀ Previous
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
                    className={`px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      currentPage === totalPages
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Form Modal - UPDATED with Category-First Selection */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">{editingId ? "✏️" : "➕"}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
              </div>
              <button onClick={() => { resetForm(); setShowForm(false); }} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Step 1: Select Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  📁 Step 1: Select Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  disabled={!!editingId}
                  required
                >
                  <option value="">-- Choose a category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {!selectedCategory && !editingId && (
                  <p className="text-xs text-amber-500 mt-1">⚠️ Select a category first to see its items</p>
                )}
              </div>

              {/* Step 2: Select Item from Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  📦 Step 2: Select Item *
                </label>
                <select
                  value={form.item}
                  onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  required
                  disabled={!!editingId || !selectedCategory}
                >
                  <option value="">-- Select an item --</option>
                  {filteredItemsByCategory.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} (Stock: {getCurrentStock(i._id)} {i.unit} | Location: {i.location})
                    </option>
                  ))}
                </select>
                {selectedCategory && filteredItemsByCategory.length === 0 && !editingId && (
                  <p className="text-xs text-rose-500 mt-1">❌ No items found in this category. Please add items first.</p>
                )}
                {editingId && <p className="text-xs text-slate-400 mt-1">Item cannot be changed when editing</p>}
              </div>

              {/* Selected Item Preview Card */}
              {form.item && !editingId && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-600 mb-2">📋 Selected Item Details</p>
                  {(() => {
                    const selectedItem = getItemDetails(form.item);
                    return selectedItem ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Name:</span>
                          <span className="font-medium text-slate-700">{selectedItem.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Category:</span>
                          <span>{selectedItem.category?.icon} {selectedItem.category?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Stock:</span>
                          <span className="font-bold text-emerald-600">{getCurrentStock(form.item)} {selectedItem.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span>{selectedItem.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Condition:</span>
                          <span>{selectedItem.condition}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Loading details...</p>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">🏷️ Transaction Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "IN" })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.type === "IN"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    📥 IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "OUT" })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.type === "OUT"
                        ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    📤 OUT
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "BORROW" })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.type === "BORROW"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    📋 BORROW
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">🔢 Quantity *</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">📅 Date</label>
                  <input
                    type="date"
                    value={form.type === "BORROW" ? form.borrowedDate : form.date}
                    onChange={(e) => {
                      if (form.type === "BORROW") {
                        setForm({ ...form, borrowedDate: e.target.value });
                      } else {
                        setForm({ ...form, date: e.target.value });
                      }
                    }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Borrow specific fields */}
              {form.type === "BORROW" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">👤 Borrower Name *</label>
                    <input
                      type="text"
                      value={form.borrowerName}
                      onChange={(e) => setForm({ ...form, borrowerName: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      placeholder="e.g., Mr. John, Class S6"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">📅 Borrowed Date</label>
                      <input
                        type="date"
                        value={form.borrowedDate}
                        onChange={(e) => setForm({ ...form, borrowedDate: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">⏰ Expected Return Date</label>
                      <input
                        type="date"
                        value={form.expectedReturnDate}
                        onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">🏢 Department</label>
                    <select
                      value={form.borrowerDepartment}
                      onChange={(e) => setForm({ ...form, borrowerDepartment: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    >
                      <option value="Classroom">📚 Classroom</option>
                      <option value="Laboratory">🔬 Laboratory</option>
                      <option value="Library">📖 Library</option>
                      <option value="Office">🏢 Office</option>
                      <option value="Event">🎉 Event</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">🎯 Purpose / Reason</label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  <option value="">Select Purpose</option>
                  <option value="Cooking">🍳 Cooking</option>
                  <option value="Classroom">📚 Classroom Use</option>
                  <option value="Laboratory">🔬 Laboratory</option>
                  <option value="Cleaning">🧹 Cleaning</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Event">🎉 Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">📄 Reference / Invoice #</label>
                <input
                  placeholder="e.g., INV-001, PO-123"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              
              {/* Preview Card */}
              {form.item && form.quantity && (
                <div className={`bg-gradient-to-r ${getTransactionGradient(form.type)} rounded-lg p-3 text-white`}>
                  <p className="text-xs font-semibold opacity-90 uppercase mb-2">📊 Preview</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {getItemDetails(form.item)?.name || "Selected Item"}
                      </p>
                      <p className="text-xs opacity-90">
                        {form.quantity} units • {form.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-90">After transaction</p>
                      <p className="font-bold text-base">
                        {getCurrentStock(form.item) + (form.type === "IN" ? parseInt(form.quantity) : form.type === "OUT" || form.type === "BORROW" ? -parseInt(form.quantity) : 0)} units
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !selectedCategory || !form.item}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  💾 {loading ? "Processing..." : (editingId ? "Update" : "Add") + " Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all text-sm"
                >
                  ❌ Cancel
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