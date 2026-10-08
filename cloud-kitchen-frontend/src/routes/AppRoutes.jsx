// Central place for all routes. Add dashboard / orders / inventory routes here later.
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import SignInPage from '../pages/Auth/SignInPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages (before sign in) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />

      {/* TODO: protected routes (orders, items, inventory, staff, billing...) */}

      {/* Unknown URL -> landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
