import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PostRequestPage from './pages/customer/PostRequestPage';
import RequestDetailPage from './pages/customer/RequestDetailPage';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import BookingDetailPage from './pages/customer/BookingDetailPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import BrowseJobsPage from './pages/provider/BrowseJobsPage';
import MyQuotesPage from './pages/provider/MyQuotesPage';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ChatPage from './pages/chat/ChatPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/post-request" element={<ProtectedRoute allowedRoles={['customer']}><PostRequestPage /></ProtectedRoute>} />
      <Route path="/customer/requests/:id" element={<ProtectedRoute allowedRoles={['customer']}><RequestDetailPage /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerBookingsPage /></ProtectedRoute>} />
      <Route path="/customer/bookings/:id" element={<ProtectedRoute allowedRoles={['customer']}><BookingDetailPage /></ProtectedRoute>} />

      {/* Provider */}
      <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/browse" element={<ProtectedRoute allowedRoles={['provider']}><BrowseJobsPage /></ProtectedRoute>} />
      <Route path="/provider/my-quotes" element={<ProtectedRoute allowedRoles={['provider']}><MyQuotesPage /></ProtectedRoute>} />
      <Route path="/provider/bookings" element={<ProtectedRoute allowedRoles={['provider']}><ProviderBookingsPage /></ProtectedRoute>} />
      <Route path="/provider/bookings/:id" element={<ProtectedRoute allowedRoles={['provider']}><BookingDetailPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />

      {/* Chat */}
      <Route path="/chat/:bookingId" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><ChatPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
