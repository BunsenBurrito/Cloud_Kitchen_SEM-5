// Central place for all routes. Everything except the landing page and sign in needs the admin to be signed in.
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/common/AppLayout';
import LandingPage from '../pages/Landing/LandingPage';
import SignInPage from '../pages/Auth/SignInPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import BillingPage from '../pages/Billing/BillingPage';
import MenuPage from '../pages/Menu/MenuPage';
import PurchasesPage from '../pages/Purchases/PurchasesPage';
import IngredientsPage from '../pages/Manage/IngredientsPage';
import InventoryPage from '../pages/Manage/InventoryPage';
import SuppliersPage from '../pages/Manage/SuppliersPage';
import CustomersPage from '../pages/Manage/CustomersPage';
import StaffPage from '../pages/Manage/StaffPage';
import SalariesPage from '../pages/Manage/SalariesPage';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  return user ? children : <Navigate to="/signin" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/salaries" element={<SalariesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
