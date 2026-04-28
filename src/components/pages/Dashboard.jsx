import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../services/itemService";
import { getCategories } from "../services/categoryService";
import { getTransactions } from "../services/stockService";
import { getBorrowedItems } from "../services/stockService";
import { getTrackedAssets } from "../services/trackedAssetService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    items: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    balance: 0,
    borrowedCount: 0,
    assetsCount: 0,
    recentTransactions: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, itemsRes, transactionsRes, borrowedRes, assetsRes] = await Promise.all([
        getCategories(),
        getItems(),
        getTransactions(),
        getBorrowedItems().catch(() => ({ data: [] })),
        getTrackedAssets().catch(() => ({ data: [] }))
      ]);

      const transactions = transactionsRes.data || [];
      
      let totalIn = 0;
      let totalOut = 0;
      transactions.forEach(t => {
        if (t.type === "IN") totalIn += t.quantity;
        else if (t.type === "OUT") totalOut += t.quantity;
      });

      setStats({
        categories: categoriesRes.data?.length || 0,
        items: itemsRes.data?.length || 0,
        totalStockIn: totalIn,
        totalStockOut: totalOut,
        balance: totalIn - totalOut,
        borrowedCount: borrowedRes.data?.length || 0,
        assetsCount: assetsRes.data?.length || 0,
        recentTransactions: transactions.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-5 py-6 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-300 text-sm">
              Welcome back! Here's what's happening with your inventory.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Link to="/categories" className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Categories</p>
                <span className="text-slate-400 text-lg group-hover:text-purple-400 transition">📂</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.categories}</p>
              <p className="text-slate-400 text-xs mt-1">Manage →</p>
            </Link>
            
            <Link to="/items" className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Total Items</p>
                <span className="text-slate-400 text-lg group-hover:text-blue-400 transition">🛒</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.items}</p>
              <p className="text-slate-400 text-xs mt-1">Manage →</p>
            </Link>
            
            <Link to="/stock" className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Stock Balance</p>
                <span className="text-slate-400 text-lg group-hover:text-emerald-400 transition">📦</span>
              </div>
              <p className={`text-2xl md:text-3xl font-bold mt-1 ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.balance}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-emerald-400">IN: +{stats.totalStockIn}</span>
                <span className="text-xs text-rose-400">OUT: -{stats.totalStockOut}</span>
              </div>
            </Link>
            
            <Link to="/borrowed" className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-xs">Borrowed</p>
                <span className="text-slate-400 text-lg group-hover:text-amber-400 transition">📋</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.borrowedCount}</p>
              <p className="text-slate-400 text-xs mt-1">Active loans</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/stock" className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all text-center group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <span className="text-white text-lg">+</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">Add Transaction</p>
        </Link>
        
        <Link to="/items" className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all text-center group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <span className="text-white text-lg">+</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">Add Item</p>
        </Link>
        
        <Link to="/categories" className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all text-center group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <span className="text-white text-lg">📂</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">Manage Categories</p>
        </Link>
        
        <Link to="/borrowed" className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all text-center group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <span className="text-white text-lg">📋</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">Borrowed Items</p>
        </Link>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Last 10 stock movements</p>
          </div>
          <Link to="/stock" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View All →
          </Link>
        </div>
        
        {stats.recentTransactions.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="text-5xl mb-3 animate-float">📊</div>
            <p className="text-slate-500 text-sm">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-1">Go to Stock page to add your first transaction</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Type</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentTransactions.map((t, idx) => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-xs">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-medium text-slate-800 text-sm">{t.item?.name}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${
                          t.type === "IN" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {t.type === "IN" ? "Stock IN" : "Stock OUT"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-slate-700">
                        {t.quantity} {t.item?.unit}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-400 text-xs">
                        {t.reference || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {stats.recentTransactions.map((t) => (
                <div key={t._id} className="p-3 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{t.item?.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                      t.type === "IN" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {t.type === "IN" ? "IN" : "OUT"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Quantity</p>
                        <p className="text-sm font-medium text-slate-800">{t.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Reference</p>
                        <p className="text-sm text-slate-600">{t.reference || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Additional Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Warning */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-sm">⚠️</span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Low Stock Alert</h3>
          </div>
          <p className="text-xs text-slate-500">
            Check items that need reordering
          </p>
          <Link to="/items" className="inline-block mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View Items →
          </Link>
        </div>

        {/* Assets Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-sm">💻</span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Assets Overview</h3>
          </div>
          <p className="text-xs text-slate-500">
            Total assets tracked: {stats.assetsCount}
          </p>
          <Link to="/tracked-assets" className="inline-block mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Manage Assets →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}