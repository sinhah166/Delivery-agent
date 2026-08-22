import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import LoginPage from '../../pages/Login';
import DashboardPage from '../../pages/Dashboard';
import DeliveriesPage from '../../pages/Deliveries';
import DeliveryDetailPage from '../../pages/DeliveryDetails';
import DeliveryVerifyPage from '../../pages/DeliveryVerify';
import NavigationPage from '../../pages/Navigation';
import PerformancePage from '../../pages/Performance';
import ExceptionsPage from '../../pages/Exceptions';
import ProfilePage from '../../pages/Profile';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'deliveries', element: <DeliveriesPage /> },
      { path: 'delivery/:id', element: <DeliveryDetailPage /> },
      { path: 'delivery/:id/verify', element: <DeliveryVerifyPage /> },
      { path: 'delivery/:id/exception', element: <ExceptionsPage /> },
      { path: 'navigation', element: <NavigationPage /> },
      { path: 'performance', element: <PerformancePage /> },
      { path: 'profile', element: <ProfilePage /> },
    ]
  }
]);
