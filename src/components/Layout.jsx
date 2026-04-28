import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "./services/api";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({ name: "Loading...", code: "" });
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle responsive
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch user and school info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await API.get("/auth/profile");
        const user = response.data;
        
        setUserName(user.name);
        if (user.school) {
          setSchoolInfo({
            name: user.school.name,
            code: user.school.schoolCode
          });
        } else {
          const schoolName = localStorage.getItem("schoolName");
          const schoolCode = localStorage.getItem("schoolCode");
          if (schoolName) {
            setSchoolInfo({ name: schoolName, code: schoolCode || "" });
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        const schoolName = localStorage.getItem("schoolName");
        const schoolCode = localStorage.getItem("schoolCode");
        if (schoolName) {
          setSchoolInfo({ name: schoolName, code: schoolCode || "" });
        }
      }
    };
    
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("schoolCode");
    localStorage.removeItem("schoolName");
    navigate("/");
  };

  const closeMenu = () => {
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // Organized menu items by logical groups
  const menuGroups = [
    {
      title: "Overview",
      items: [
        { path: "/dashboard", name: "Dashboard", icon: "📊", description: "View inventory summary and statistics" },
        { path: "/profile", name: "My Profile", icon: "👤", description: "Manage your account information" },
      ]
    },
    {
      title: "Inventory Setup",
      items: [
        { path: "/categories", name: "Categories", icon: "📂", description: "Organize items by categories" },
        { path: "/items", name: "Items", icon: "🛒", description: "Manage all inventory items" },
      ]
    },
    {
      title: "Stock Operations",
      items: [
        { path: "/stock", name: "Stock Management", icon: "📦", description: "Track IN, OUT, BORROW, RETURN" },
        { path: "/borrowed", name: "Borrowed Items", icon: "📋", description: "View and manage borrowed items" },
      ]
    },
    {
      title: "Asset Management",
      items: [
        { path: "/assets", name: "Assets", icon: "🏗️", description: "Manage school assets and equipment" },
        { path: "/tracked-assets", name: "Asset Tracking", icon: "💻", description: "Track computers and electronics" },
      ]
    },
    {
      title: "School Feeding",
      items: [
        { path: "/feeding", name: "Feeding Records", icon: "🍽️", description: "Record food receipts and usage" },
      ]
    },
    {
      title: "Facility Management",
      items: [
        { path: "/laboratory", name: "Laboratory", icon: "🔬", description: "Manage lab equipment and chemicals" },
        { path: "/library", name: "Library", icon: "📚", description: "Manage library books collection" },
        { path: "/cleaning-supplies", name: "Cleaning Supplies", icon: "🧹", description: "Track cleaning inventory" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 bg-gray-900 rounded-lg text-white shadow-lg md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        ${!isMobile && (isSidebarOpen ? "w-64" : "w-20")}
        ${isMobile && (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}
        bg-gray-900 text-white transition-all duration-300 flex flex-col
        fixed md:relative z-30 h-full shadow-xl
        ${isMobile ? "w-64" : ""}
      `}>
        {/* Logo with Dynamic School Name */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏫</span>
              {isSidebarOpen && (
                <div>
                  <span className="font-bold text-lg block truncate max-w-[140px]">
                    {schoolInfo.name !== "Loading..." ? schoolInfo.name.split(' ').slice(0, 2).join(' ') : "G.S AGATEKO"}
                  </span>
                  {schoolInfo.code && (
                    <span className="text-xs text-gray-400 block">Code: {schoolInfo.code}</span>
                  )}
                  {userName && (
                    <span className="text-xs text-gray-500 block mt-1">👤 {userName.split(' ')[0]}</span>
                  )}
                </div>
              )}
            </div>
            {!isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? "◀" : "▶"}
              </button>
            )}
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Hint for collapsed sidebar */}
          {!isSidebarOpen && !isMobile && (
            <div className="mt-3 text-center bg-gray-800 rounded-lg py-1.5">
              <p className="text-xs text-gray-400">💡 Hover over icons</p>
            </div>
          )}
        </div>

        {/* Welcome User Section (when sidebar is open) */}
        {isSidebarOpen && userName && (
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-400">Welcome back,</p>
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
          </div>
        )}

        {/* Navigation with Groups */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              {isSidebarOpen && group.title && (
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </p>
                </div>
              )}
              {group.items.map((item) => (
                <div
                  key={item.path}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="text-xl min-w-[28px]" aria-label={item.name}>{item.icon}</span>
                    {isSidebarOpen ? (
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{item.name}</span>
                        <span className="text-xs text-gray-500 truncate block">{item.description}</span>
                      </div>
                    ) : null}
                  </Link>
                  
                  {/* Tooltip for collapsed sidebar - positioned absolutely */}
                  {!isSidebarOpen && !isMobile && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[180px]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-semibold text-sm">{item.name}</span>
                        </div>
                        <span className="text-xs text-gray-300 mt-1">{item.description}</span>
                      </div>
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* School Info Footer (when sidebar is open) */}
        {isSidebarOpen && schoolInfo.code && (
          <div className="p-3 border-t border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 truncate">{schoolInfo.name}</p>
                <code className="text-xs font-mono text-gray-500">ID: {schoolInfo.code}</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(schoolInfo.code);
                  alert("School code copied!");
                }}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-700"
                title="Copy school code"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="text-xl min-w-[28px]">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header with School Name */}
        {isMobile && (
          <div className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🏫</span>
                <span className="font-bold text-gray-800">{schoolInfo.name !== "Loading..." ? schoolInfo.name.split(' ').slice(0, 2).join(' ') : "G.S AGATEKO"}</span>
              </div>
              {schoolInfo.code && (
                <span className="text-xs text-gray-500 mt-0.5">Code: {schoolInfo.code}</span>
              )}
            </div>
          </div>
        )}
        <div className="p-4 md:p-6">{children}</div>
      </div>

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        /* Ensure group-hover works */
        .group-hover\\:opacity-100:hover {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </div>
  );
}