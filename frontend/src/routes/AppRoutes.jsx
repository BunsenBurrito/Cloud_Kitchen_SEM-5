// Central place for all routes. Add dashboard / orders / inventory routes here later.
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import SignInPage from '../pages/Auth/SignInPage';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import SignUpPage from '../pages/Auth/SignUpPage';
import MenuPage from '../pages/Menu/MenuPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages (before sign in) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/menu" element={<MenuPage />} />

      {/* TODO: protected routes (orders, items, inventory, staff, billing...) */}

      {/* Unknown URL -> landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
