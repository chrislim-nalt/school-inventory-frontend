import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryType: "OTHER",
    icon: "📦",
  });

  // Fresh color palette - Modern gradients
  const categoryTypes = [
    { value: "CONSUMABLE_FOOD", label: "Food Items", icon: "🍚", gradient: "from-rose-400 to-rose-500", badge: "bg-rose-100 text-rose-700" },
    { value: "CONSUMABLE_NON_FOOD", label: "Supplies", icon: "🧹", gradient: "from-teal-400 to-teal-500", badge: "bg-teal-100 text-teal-700" },
    { value: "EQUIPMENT_OFFICE", label: "Office", icon: "🖥️", gradient: "from-indigo-400 to-indigo-500", badge: "bg-indigo-100 text-indigo-700" },
    { value: "EQUIPMENT_KITCHEN", label: "Kitchen", icon: "🍳", gradient: "from-amber-400 to-amber-500", badge: "bg-amber-100 text-amber-700" },
    { value: "EQUIPMENT_LAB", label: "Laboratory", icon: "🔬", gradient: "from-violet-400 to-violet-500", badge: "bg-violet-100 text-violet-700" },
    { value: "EQUIPMENT_SPORTS", label: "Sports", icon: "⚽", gradient: "from-emerald-400 to-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    { value: "EQUIPMENT_TECH", label: "Technology", icon: "💻", gradient: "from-cyan-400 to-cyan-500", badge: "bg-cyan-100 text-cyan-700" },
    { value: "FURNITURE", label: "Furniture", icon: "🪑", gradient: "from-orange-400 to-orange-500", badge: "bg-orange-100 text-orange-700" },
    { value: "BOOKS", label: "Books", icon: "📚", gradient: "from-red-400 to-red-500", badge: "bg-red-100 text-red-700" },
    { value: "CHEMICALS", label: "Chemicals", icon: "🧪", gradient: "from-pink-400 to-pink-500", badge: "bg-pink-100 text-pink-700" },
    { value: "LIVESTOCK", label: "Livestock", icon: "🐄", gradient: "from-lime-400 to-lime-500", badge: "bg-lime-100 text-lime-700" },
    { value: "FIXED_ASSET", label: "Assets", icon: "🏢", gradient: "from-slate-400 to-slate-500", badge: "bg-slate-100 text-slate-700" },
    { value: "OTHER", label: "Other", icon: "📦", gradient: "from-gray-400 to-gray-500", badge: "bg-gray-100 text-gray-700" },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = selectedType === "ALL" 
    ? categories 
    : categories.filter(cat => cat.categoryType === selectedType);

  const summaryStats = {
    total: categories.length,
    activeTypes: new Set(categories.map(c => c.categoryType)).size,
    recent: categories.filter(c => {
      const daysSince = (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length
  };

  const resetForm = () => {
    setForm({ name: "", description: "", categoryType: "OTHER", icon: "📦" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleShowForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        setSuccess("Category updated successfully!");
      } else {
        await createCategory(form);
        setSuccess("Category created successfully!");
      }
      handleCloseForm();
      fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save category");
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      categoryType: cat.categoryType || "OTHER",
      icon: cat.icon || "📦",
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      setLoading(true);
      try {
        await deleteCategory(id);
        setSuccess("Category deleted!");
        fetchCategories();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete");
        setLoading(false);
      }
    }
  };

  const getCategoryStyle = (type) => {
    return categoryTypes.find(ct => ct.value === type) || categoryTypes[12];
  };

  const handleCategoryTypeChange = (e) => {
    const selectedType = e.target.value;
    const selectedIcon = categoryTypes.find(t => t.value === selectedType)?.icon || "📦";
    setForm({ ...form, categoryType: selectedType, icon: selectedIcon });
  };

  return (
    <div className="space-y-6 font-['Inter',system-ui,-apple-system,sans-serif]">
      
      {/* Success Toast Animation */}
      {success && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl">⚠</span>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Hero Section - Modern Minimal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-10 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                Categories
              </h1>
              <p className="text-slate-300 text-base">
                Organize your inventory with smart categories
              </p>
            </div>
            
            <button
              onClick={handleShowForm}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg"
            >
              <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add Category
            </button>
          </div>

          {/* Stats Cards - Clean Numbers */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <p className="text-slate-300 text-sm mb-1">Total</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{summaryStats.total}</p>
              <p className="text-slate-400 text-xs mt-2">categories</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <p className="text-slate-300 text-sm mb-1">Types</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{summaryStats.activeTypes}</p>
              <p className="text-slate-400 text-xs mt-2">variations</p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <p className="text-slate-300 text-sm mb-1">New</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{summaryStats.recent}</p>
              <p className="text-slate-400 text-xs mt-2">last 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Filter - Minimal Chips */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelectedType("ALL")}
          className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
            selectedType === "ALL"
              ? "bg-slate-900 text-white shadow-lg scale-105"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Categories
        </button>
        
        {categoryTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
              selectedType === type.value
                ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg scale-105`
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span className="text-lg">{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Loading Animation */}
      {loading && !showForm ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading...</p>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State - Beautiful */
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="animate-float inline-block">
            <div className="text-8xl mb-4">📂</div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No categories yet</h3>
          <p className="text-slate-500 mb-6">Start organizing your inventory by creating your first category</p>
          <button
            onClick={handleShowForm}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>✨</span>
            Create Category
          </button>
        </div>
      ) : (
        /* Categories Grid - Modern Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat, index) => {
            const style = getCategoryStyle(cat.categoryType);
            return (
              <div
                key={cat._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {style.icon}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{cat.name}</h3>
                  
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium ${style.badge} mb-3`}>
                    {style.icon} {style.label}
                  </span>
                  
                  {cat.description && (
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300 flex items-center justify-center">
                      <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">→</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Modern Floating Design */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={handleCloseForm}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className={`h-2 rounded-t-3xl bg-gradient-to-r ${categoryTypes.find(t => t.value === form.categoryType)?.gradient || 'from-gray-400 to-gray-500'}`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingId ? "Edit Category" : "New Category"}
                  </h2>
                  <button 
                    onClick={handleCloseForm} 
                    className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 text-2xl flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      placeholder="e.g., Office Supplies"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category Type</label>
                    <select
                      value={form.categoryType}
                      onChange={handleCategoryTypeChange}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none bg-white"
                    >
                      {categoryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                      rows="3"
                      placeholder="Add a description for this category..."
                    />
                  </div>

                  {/* Preview Chip */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Preview</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{categoryTypes.find(t => t.value === form.categoryType)?.icon}</span>
                      <div>
                        <p className="font-medium text-slate-800">{form.name || "Category Name"}</p>
                        <p className="text-xs text-slate-500">{categoryTypes.find(t => t.value === form.categoryType)?.label}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : (editingId ? "Update" : "Create")}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}