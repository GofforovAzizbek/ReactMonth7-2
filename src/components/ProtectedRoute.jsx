import { Navigate } from "react-router-dom";

// Admin sahifalarni himoya qiladigan oddiy guard
function ProtectedRoute({ children }) {
  const cookieToken = document.cookie
    .split("; ")
    .find((item) => item.startsWith("adminToken="))
    ?.split("=")[1];
  const isAuthenticated =
    localStorage.getItem("adminToken") === "authenticated" ||
    cookieToken === "authenticated";

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
