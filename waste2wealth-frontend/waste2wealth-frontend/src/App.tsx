import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';

import DashboardRouter from '@/pages/dashboard/DashboardRouter';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import WasteDetailsPage from '@/pages/marketplace/WasteDetailsPage';
import UploadWastePage from '@/pages/waste/UploadWastePage';
import TransactionsPage from '@/pages/TransactionsPage';
import MessagesPage from '@/pages/messages/MessagesPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<ProtectedRoute><VerifyOtpPage /></ProtectedRoute>} />

          {/* Authenticated (any role) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/waste/:id" element={<ProtectedRoute><WasteDetailsPage /></ProtectedRoute>} />
          <Route path="/waste/new" element={<ProtectedRoute allowedRoles={['generator', 'admin']}><UploadWastePage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
