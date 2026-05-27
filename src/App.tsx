// App.tsx

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLaysOut from './layouts/DashboardLaysOut';
import Product          from './page/Products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster }      from 'sonner';
import Reports          from './page/Reports';
import Orders           from './page/Orders';
import PosPage          from './page/PosPage';
import Category         from './page/Category';
import Dashboard        from './page/Dashboard';
import FormLoginPage    from './page/FormLoginPage';
import MainLayout       from './layouts/MainLayout';
import { getAccessToken } from './utils/TokenStorage';
import { getRole }        from './utils/auth';

const queryClient = new QueryClient();

// ─── Protected Route (must be logged in) ─────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Admin Only Route ─────────────────────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/login" replace />;
  if (getRole() !== "admin") return <Navigate to="/admin/pos" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ─── Public Routes ──────────────────── */}
          <Route element={<MainLayout />}>
            <Route path="/login"  element={<FormLoginPage />} />
            <Route path="/signup" element={<FormLoginPage />} /> {/* ✅ added */}
          </Route>

          {/* ─── Protected Routes ───────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLaysOut />
              </ProtectedRoute>
            }
          >
            {/* 🛒 POS — admin + cashier */}
            <Route path="/admin/pos" element={<PosPage />} />

            {/* 📊 Dashboard — admin only */}
            <Route path="/admin/dashboard" element={
              <AdminRoute><Dashboard /></AdminRoute>
            } />

            {/* 📦 Products — admin only */}
            <Route path="/admin/products" element={
              <AdminRoute><Product /></AdminRoute>
            } />

            {/* 📂 Categories — admin only */}
            <Route path="/admin/categories" element={
              <AdminRoute><Category /></AdminRoute>
            } />

            {/* 📈 Reports — admin only */}
            <Route path="/admin/reports" element={
              <AdminRoute><Reports /></AdminRoute>
            } />
            <Route path="/admin/reports/daily" element={
              <AdminRoute><Reports /></AdminRoute>
            } />
            <Route path="/admin/reports/monthly" element={
              <AdminRoute><Reports /></AdminRoute>
            } />

            {/* ─── Default redirect by role ────────── */}
            <Route
              path="*"
              element={
                getRole() === "admin"
                  ? <Navigate to="/admin/dashboard" replace />
                  : <Navigate to="/admin/pos"       replace />
              }
            />

          </Route>

        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;   