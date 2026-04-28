import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // ❌ No token or invalid token → send to login
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  // ✅ Token exists → allow access
  return children;
}