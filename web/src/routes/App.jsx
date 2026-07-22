import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/admin/LoginPage.jsx';
import { DashboardPage } from '../pages/admin/DashboardPage.jsx';
import { UsersPage } from '../pages/admin/UsersPage.jsx';
import { ArtisansPage } from '../pages/admin/ArtisansPage.jsx';
import { CategoriesPage } from '../pages/admin/CategoriesPage.jsx';
import { ServiceRequestsPage } from '../pages/admin/ServiceRequestsPage.jsx';
import { ReviewsPage } from '../pages/admin/ReviewsPage.jsx';
import { NotificationsPage } from '../pages/admin/NotificationsPage.jsx';
import { StatisticsPage } from '../pages/admin/StatisticsPage.jsx';
import { SettingsPage } from '../pages/admin/SettingsPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

const protectedPage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={protectedPage(<DashboardPage />)} />
      <Route path="/users" element={protectedPage(<UsersPage />)} />
      <Route path="/artisans" element={protectedPage(<ArtisansPage />)} />
      <Route path="/categories" element={protectedPage(<CategoriesPage />)} />
      <Route path="/service-requests" element={protectedPage(<ServiceRequestsPage />)} />
      <Route path="/reviews" element={protectedPage(<ReviewsPage />)} />
      <Route path="/notifications" element={protectedPage(<NotificationsPage />)} />
      <Route path="/statistics" element={protectedPage(<StatisticsPage />)} />
      <Route path="/settings" element={protectedPage(<SettingsPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
