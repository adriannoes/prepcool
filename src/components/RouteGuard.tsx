import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  requiresAuth?: boolean;
}

const RouteGuard = ({ requiresAuth = true }: RouteGuardProps) => {
  const { user, loading } = useAuth();
  
  // If still loading, show nothing or a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral"></div>
      </div>
    );
  }
  
  // If requires auth and no user is logged in, redirect to login
  if (requiresAuth && !user) {
    return <Navigate to="/login" />;
  }
  
  // If user is logged in and tries to access login or signup page, redirect to dashboard
  if (!requiresAuth && user) {
    return <Navigate to="/dashboard" />;
  }
  
  // Otherwise render the child routes
  return <Outlet />;
};

export default RouteGuard;
