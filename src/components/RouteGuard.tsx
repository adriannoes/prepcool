
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
  
  // If still loading, show a more styled loading spinner
  if (authLoading || (requiresAdmin && adminLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Verificando permissões...</p>
      </div>
    );
  }
  
  // If requires auth and no user is logged in, redirect to login
  if (requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If requires admin and user is not admin, redirect to dashboard
  if (requiresAdmin && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If user is logged in and tries to access login or signup page, redirect to dashboard
  if (!requiresAuth && user) {
    return <Navigate to="/dashboard" />;
  }
  
  // Otherwise render the child routes
  return <Outlet />;
};

export default RouteGuard;
