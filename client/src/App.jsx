import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import KitchenDashboard from "./pages/KitchenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MenuManagement from "./pages/MenuManagement";
import TableManagement from "./pages/TableManagement";
import AnalyticsPage from "./pages/AnalyticsPage";

// Protected route wrapper
function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Staff layout
function StaffLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Customer layout
function CustomerLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Customer */}
      <Route element={<CustomerLayout />}>
        <Route path="/menu/:tableId" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />
      </Route>

      {/* Kitchen */}
      <Route element={<ProtectedRoute roles={["admin", "kitchen"]} />}>
        <Route element={<StaffLayout />}>
          <Route path="/kitchen" element={<KitchenDashboard />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<StaffLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;