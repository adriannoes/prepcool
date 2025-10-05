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
  
  console.log('🛡️ RouteGuard - State:', {
    requiresAuth,
    requiresAdmin,
    user: user?.email,
    userId: user?.id,
    authLoading,
    isAdmin,
    adminLoading,
    path: location.pathname
  });
  
  // If still loading, show a more styled loading spinner
  if (authLoading || (requiresAdmin && adminLoading)) {
    console.log('⏳ RouteGuard: Loading auth or admin status...');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Verificando permissões...</p>
      </div>
    );
  }
  
  // If requires auth and no user is logged in, redirect to login
  if (requiresAuth && !user) {
    console.log('🚫 RouteGuard: Auth required but no user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If requires admin and user is not admin, redirect to dashboard
  if (requiresAdmin && (!user || !isAdmin)) {
    console.log('🚫 RouteGuard: Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // If user is logged in and tries to access login or signup page, redirect to dashboard
  if (!requiresAuth && user) {
    console.log('↩️ RouteGuard: User logged in but trying to access public page, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }
  
  console.log('✅ RouteGuard: Access granted, rendering outlet');
  // Otherwise render the child routes
  return <Outlet />;
};

export default RouteGuard;
