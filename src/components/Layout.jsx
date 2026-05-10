import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "./services/api";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({ name: "Loading...", code: "" });
  const [userName, setUserName] = useState("");
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const tooltipTimeoutRef = useRef(null);

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
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsMobileDrawerOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await API.get("/auth/profile");
        const user = response.data;
        setUserName(user.name);
        if (user.school) {
          setSchoolInfo({ name: user.school.name, code: user.school.schoolCode });
        } else {
          const schoolName = localStorage.getItem("schoolName");
          const schoolCode = localStorage.getItem("schoolCode");
          if (schoolName) setSchoolInfo({ name: schoolName, code: schoolCode || "" });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        const schoolName = localStorage.getItem("schoolName");
        const schoolCode = localStorage.getItem("schoolCode");
        if (schoolName) setSchoolInfo({ name: schoolName, code: schoolCode || "" });
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const showTooltip = (e, itemName, itemDesc) => {
    if (!isSidebarOpen && !isMobile) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({ show: true, text: `${itemName} — ${itemDesc}`, x: rect.right + 12, y: rect.top + rect.height / 2 });
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const hideTooltip = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({ show: false, text: "", x: 0, y: 0 });
    }, 150);
  };

  const clearTooltip = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setTooltip({ show: false, text: "", x: 0, y: 0 });
  };

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { path: "/dashboard", name: "Dashboard", icon: "📊", description: "View inventory summary" },
        { path: "/profile", name: "My Profile", icon: "👤", description: "Manage your account" },
      ],
    },
    {
      title: "Inventory Setup",
      items: [
        { path: "/categories", name: "Categories", icon: "📂", description: "Organize items" },
        { path: "/items", name: "Items", icon: "🛒", description: "Manage inventory" },
      ],
    },
    {
      title: "Stock Operations",
      items: [
        { path: "/stock", name: "Stock Management", icon: "📦", description: "Track movements" },
        { path: "/borrowed", name: "Borrowed Items", icon: "📋", description: "Manage borrows" },
      ],
    },
    {
      title: "Asset Management",
      items: [
        { path: "/assets", name: "Assets", icon: "🏗️", description: "School assets" },
        { path: "/tracked-assets", name: "Asset Tracking", icon: "💻", description: "Track electronics" },
      ],
    },
    {
      title: "School Feeding",
      items: [
        { path: "/feeding", name: "Feeding Records", icon: "🍽️", description: "Food management" },
      ],
    },
    {
      title: "Facility Management",
      items: [
        { path: "/laboratory", name: "Laboratory", icon: "🔬", description: "Lab equipment" },
        { path: "/library", name: "Library", icon: "📚", description: "Books collection" },
        { path: "/cleaning-supplies", name: "Cleaning Supplies", icon: "🧹", description: "Cleaning inventory" },
      ],
    },
  ];

  // Flat list for bottom nav (most important 4 + "More")
  const bottomNavItems = [
    { path: "/dashboard", name: "Dashboard", icon: "📊" },
    { path: "/items", name: "Items", icon: "🛒" },
    { path: "/stock", name: "Stock", icon: "📦" },
    { path: "/assets", name: "Assets", icon: "🏗️" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Tooltip (desktop collapsed sidebar) ── */}
      {tooltip.show && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
            zIndex: 9999,
            backgroundColor: "#1f2937",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: "sans-serif",
          }}
        >
          {tooltip.text}
          <div
            style={{
              position: "absolute",
              left: "-5px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid #1f2937",
            }}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR
      ═══════════════════════════════════════ */}
      {!isMobile && (
        <div
          className={`${isSidebarOpen ? "w-64" : "w-16"} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 shadow-2xl`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl flex-shrink-0">🏫</span>
                {isSidebarOpen && (
                  <div className="overflow-hidden">
                    <span className="font-bold text-lg block truncate">
                      {schoolInfo.name !== "Loading..." ? schoolInfo.name.split(" ").slice(0, 2).join(" ") : "G.S AGATEKO"}
                    </span>
                    {schoolInfo.code && <span className="text-xs text-gray-400 block truncate">Code: {schoolInfo.code}</span>}
                    {userName && <span className="text-xs text-gray-500 block truncate">👤 {userName.split(" ")[0]}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-all duration-200 flex-shrink-0"
              >
                {isSidebarOpen ? "◀" : "▶"}
              </button>
            </div>
          </div>

          {/* Welcome */}
          {isSidebarOpen && userName && (
            <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50">
              <p className="text-xs text-gray-400">Welcome back,</p>
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 mt-2 overflow-y-auto">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-4">
                {isSidebarOpen && group.title && (
                  <div className="px-4 mb-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.title}</p>
                  </div>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={(e) => showTooltip(e, item.name, item.description)}
                    onMouseLeave={hideTooltip}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-gray-800 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } ${!isSidebarOpen ? "justify-center" : ""}`}
                  >
                    <span className={`flex-shrink-0 ${!isSidebarOpen ? "text-2xl" : "text-xl"}`}>{item.icon}</span>
                    {isSidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{item.name}</span>
                        <span className="text-xs text-gray-500 truncate">{item.description}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* School footer */}
          {isSidebarOpen && schoolInfo.code && (
            <div className="p-2 border-t border-gray-700 bg-gray-800/30">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-gray-400 truncate">{schoolInfo.name}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(schoolInfo.code)}
                  className="text-gray-500 hover:text-gray-300 text-xs p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Copy school code"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-3 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 ${
                !isSidebarOpen ? "justify-center" : ""
              }`}
            >
              <span className="text-xl flex-shrink-0">🚪</span>
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MOBILE — Full-screen Drawer
      ═══════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {isMobileDrawerOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
              isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Drawer header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏫</span>
                  <div>
                    <p className="font-bold text-white leading-tight">
                      {schoolInfo.name !== "Loading..." ? schoolInfo.name.split(" ").slice(0, 3).join(" ") : "G.S AGATEKO"}
                    </p>
                    {schoolInfo.code && <p className="text-xs text-gray-400">Code: {schoolInfo.code}</p>}
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {userName && (
                <div className="mt-3 flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold text-white">{userName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer nav — scrollable */}
            <nav className="flex-1 overflow-y-auto py-2">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="mb-2">
                  <div className="px-4 py-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{group.title}</p>
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all duration-150 ${
                        isActive(item.path)
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700"
                      }`}
                    >
                      <span className="text-2xl w-8 text-center flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.description}</p>
                      </div>
                      {isActive(item.path) && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="p-3 border-t border-gray-700 space-y-1">
              {schoolInfo.code && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-400 truncate">{schoolInfo.name}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(schoolInfo.code)}
                    className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors ml-2 flex-shrink-0"
                    title="Copy school code"
                  >
                    📋 Copy
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className={`flex-1 overflow-auto flex flex-col ${isMobile ? "pb-20" : ""}`}>

        {/* Mobile top bar */}
        {isMobile && (
          <div className="bg-gray-900 text-white px-4 py-3 sticky top-0 z-30 flex items-center gap-3 shadow-lg">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl">🏫</span>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight truncate">
                  {schoolInfo.name !== "Loading..." ? schoolInfo.name.split(" ").slice(0, 3).join(" ") : "G.S AGATEKO"}
                </p>
                {schoolInfo.code && <p className="text-xs text-gray-400">Code: {schoolInfo.code}</p>}
              </div>
            </div>

            {/* Current page label */}
            <div className="flex-shrink-0">
              {(() => {
                const allItems = menuGroups.flatMap((g) => g.items);
                const current = allItems.find((i) => i.path === location.pathname);
                return current ? (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                    {current.icon} {current.name}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE BOTTOM NAV BAR
      ═══════════════════════════════════════ */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900 border-t border-gray-700 shadow-2xl">
          <div className="flex items-stretch">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all duration-150 ${
                  isActive(item.path)
                    ? "text-blue-400 bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-xs mt-1 font-medium leading-tight text-center">{item.name}</span>
                {isActive(item.path) && (
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1" />
                )}
              </Link>
            ))}

            {/* "More" button opens full drawer */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all duration-150 text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700`}
            >
              <span className="text-xl leading-none">☰</span>
              <span className="text-xs mt-1 font-medium leading-tight">More</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}