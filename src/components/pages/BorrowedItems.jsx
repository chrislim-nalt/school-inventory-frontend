import { useEffect, useState } from "react";
import { getBorrowedItems, returnBorrowedItem } from "../services/stockService";

export default function BorrowedItems() {
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBorrowedItems();
      setBorrowed(res.data || []);
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
      setError(error.response?.data?.message || "Failed to load borrowed items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = borrowed.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(borrowed.length / itemsPerPage);

  const handleReturn = async (id) => {
    if (window.confirm("Confirm return of this item?")) {
      setLoading(true);
      try {
        // Remove the second parameter - just pass the ID
        await returnBorrowedItem(id);
        setSuccess("Item returned successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error returning item:", error);
        setError(error.response?.data?.message || "Failed to return item");
        setLoading(false);
      }
    }
  };

  const isOverdue = (expectedDate) => {
    if (!expectedDate) return false;
    return new Date(expectedDate) < new Date();
  };

  const getDaysRemaining = (expectedDate) => {
    if (!expectedDate) return null;
    const today = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  // Statistics
  const stats = {
    total: borrowed.length,
    overdue: borrowed.filter(item => isOverdue(item.expectedReturnDate)).length,
    totalQuantity: borrowed.reduce((sum, item) => sum + (item.quantity || 0), 0)
  };

  return (
    <div className="space-y-4">
      
      {/* Toast Messages */}
      {(success || error) && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in ${
          success ? "bg-emerald-500" : "bg-amber-500"
        } text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-sm`}>
          <span className="text-lg">{success ? "✓" : "ℹ️"}</span>
          <p className="font-medium">{success || error}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                Borrowed Items
              </h1>
              <p className="text-slate-300 text-sm">
                Track items currently borrowed and manage returns
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/stock"}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg text-sm"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              New Borrow Request
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Total Borrowed</p>
                <span className="text-amber-400 text-lg">📋</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total}</p>
              <p className="text-slate-400 text-xs mt-1">{stats.totalQuantity} items</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Overdue</p>
                <span className="text-rose-400 text-lg">⚠️</span>
              </div>
              <p className={`text-2xl md:text-3xl font-bold mt-1 ${stats.overdue > 0 ? 'text-rose-400' : 'text-white'}`}>
                {stats.overdue}
              </p>
              <p className="text-slate-400 text-xs mt-1">need attention</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">On Time</p>
                <span className="text-emerald-400 text-lg">✅</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total - stats.overdue}</p>
              <p className="text-slate-400 text-xs mt-1">in good standing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {borrowed.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, borrowed.length)} of {borrowed.length} borrowed items
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && borrowed.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
          </div>
        </div>
      ) : borrowed.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-3 animate-float">📋</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No borrowed items</h3>
          <p className="text-slate-500 text-sm mb-2">No items are currently borrowed</p>
          <p className="text-xs text-slate-400 mb-4">
            To borrow items, go to Stock Management, select "BORROW" as transaction type
          </p>
          <button
            onClick={() => window.location.href = "/stock"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            <span>✨</span> Go to Stock Management
          </button>
        </div>
      ) : (
        /* Borrowed Items Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Borrower</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Department</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Borrowed Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Expected Return</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item, index) => {
                  const overdue = isOverdue(item.expectedReturnDate);
                  const daysRemaining = getDaysRemaining(item.expectedReturnDate);
                  
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm">
                            📦
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.item?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-600 text-sm">👤</span>
                          <span className="text-slate-700 text-sm">{item.borrowerName || "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                        {item.borrowerDepartment || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-slate-700">
                        {item.quantity} {item.item?.unit}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-xs">
                        {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-sm ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                            {item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString() : "-"}
                          </span>
                          {daysRemaining !== null && !overdue && daysRemaining <= 3 && daysRemaining > 0 && (
                            <span className="text-xs text-amber-600">Due in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
                          )}
                          {overdue && daysRemaining !== null && (
                            <span className="text-xs text-rose-600">{Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${
                          overdue 
                            ? "bg-rose-100 text-rose-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {overdue ? "⚠️ OVERDUE" : "📋 BORROWED"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleReturn(item._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all text-xs font-medium"
                        >
                          🔄 Return Item
                        </button>
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
                    ← Prev
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
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}