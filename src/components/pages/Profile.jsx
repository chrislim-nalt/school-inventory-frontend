import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get("/auth/profile");
      setUser(response.data);
      setForm({
        name: response.data.name,
        email: response.data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.put("/auth/profile", {
        name: form.name,
        email: form.email,
      });
      setSuccess("Profile updated successfully!");
      fetchProfile();
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Password changed successfully!");
      setForm({
        ...form,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
              My Profile
            </h1>
            <p className="text-slate-300 text-sm">
              View and manage your account information
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Profile Card - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-4xl text-indigo-600">👤</span>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <h2 className="text-xl font-bold text-white mt-4">{user?.name}</h2>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
              <p className="text-indigo-200 text-xs mt-2">
                Joined {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Profile Details */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Role</p>
                  <p className="text-sm font-medium text-slate-700 capitalize">{user?.role || "Staff"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last Login</p>
                  <p className="text-sm font-medium text-slate-700">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "First login"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Profile & Change Password */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Edit Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">Profile Information</h2>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="p-5">
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setForm({ ...form, name: user.name, email: user.email });
                      }}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row py-2 border-b border-slate-100">
                    <div className="sm:w-32 text-xs font-semibold text-slate-500">Full Name</div>
                    <div className="flex-1 text-sm text-slate-800">{user?.name}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 border-b border-slate-100">
                    <div className="sm:w-32 text-xs font-semibold text-slate-500">Email</div>
                    <div className="flex-1 text-sm text-slate-800">{user?.email}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 border-b border-slate-100">
                    <div className="sm:w-32 text-xs font-semibold text-slate-500">Role</div>
                    <div className="flex-1 text-sm text-slate-800 capitalize">{user?.role || "Staff"}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2">
                    <div className="sm:w-32 text-xs font-semibold text-slate-500">Account Status</div>
                    <div className="flex-1">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">Change Password</h2>
              </div>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Password must be at least 6 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}