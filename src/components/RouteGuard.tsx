
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  requiresAuth?: boolean;
}

const RouteGuard = ({ requiresAuth = true }: RouteGuardProps) => {
  const { user, loading } = useAuth();
  
  // If still loading, show a more styled loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Carregando...</p>
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
