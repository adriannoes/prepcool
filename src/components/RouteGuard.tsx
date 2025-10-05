import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const RouteGuard = ({ requiresAuth = true, requiresAdmin = false }: RouteGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  
  // If still loading, show a loading spinner
  if (authLoading || (requiresAdmin && adminLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Verificando permissões...</p>
      </div>
    );
  }
  
  // For routes that don't require auth (login/signup pages)
  if (!requiresAuth) {
    // If user is already logged in and tries to access login or signup, redirect to dashboard
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      return <Navigate to="/dashboard" replace />;
    }
    // Otherwise allow access to login/signup pages
    return <Outlet />;
  }
  
  // For routes that require authentication
  if (requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For routes that require admin privileges
  if (requiresAdmin && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has required permissions
  return <Outlet />;
};

export default RouteGuard;
