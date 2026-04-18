import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Cart from "./components/Cart";
import ProductDetail from "./pages/ProductDetail";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import CartPage from "./pages/CartPage";
import ShopCasual from "./pages/ShopCasual";
import AdminDashboard from "./pages/Admin/Dashboard";
import AddEditProduct from "./pages/Admin/AddEditProduct";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastViewport from "./components/ToastViewport";

// Route bo'yicha umumiy layout qoidalari
function AppContent() {
  const location = useLocation();
  const path = location.pathname;
  const isLoginPage = path === "/login";
  const isAdminPage = path.startsWith("/admin");
  const isPublicPage = !(isLoginPage || isAdminPage);
  const showHeader = isPublicPage;
  const showFooter = isPublicPage;
  const showHero = path === "/";

  return (
    <>
      {showHeader && <Header />}
      {showHero && <Main />}
      <div key={path} className="animate-page-in">
        <Routes>
          <Route path="/" element={<Cart />} />
          <Route path="/shop/:style" element={<ShopCasual />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add"
            element={
              <ProtectedRoute>
                <AddEditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute>
                <AddEditProduct />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {showFooter && <Footer />}
      <ToastViewport />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
