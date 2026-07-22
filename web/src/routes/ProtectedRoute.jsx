import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { bootstrapping, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="grid min-h-screen place-items-center bg-surface text-lg font-bold text-primary">FasoConnect Admin</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
