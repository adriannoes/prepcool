
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
  
  console.log('🛡️ RouteGuard: Checking route access', {
    path: location.pathname,
    requiresAuth,
    requiresAdmin,
    user: user?.email,
    authLoading,
    adminLoading,
    isAdmin
  });

  // If still loading auth, show loading spinner
  if (authLoading) {
    console.log('⏳ RouteGuard: Auth still loading, showing spinner');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Carregando autenticação...</p>
      </div>
    );
  }
  
  // For routes that don't require auth (login/signup pages)
  if (!requiresAuth) {
    console.log('🔓 RouteGuard: Route does not require auth');
    // If user is already logged in and tries to access login or signup, redirect to dashboard
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log('🔄 RouteGuard: Authenticated user accessing auth page, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    console.log('✅ RouteGuard: Allowing access to public route');
    return <Outlet />;
  }
  
  // For routes that require authentication
  if (requiresAuth && !user) {
    console.log('❌ RouteGuard: Authentication required but no user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For routes that require admin privileges
  if (requiresAdmin) {
    if (!user) {
      console.log('❌ RouteGuard: Admin route accessed without authentication, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // IMMEDIATE ACCESS for designated admin - no waiting
    if (user.email === 'dev@dev.com') {
      console.log('✅ RouteGuard: IMMEDIATE ADMIN ACCESS GRANTED for dev@dev.com');
      return <Outlet />;
    }
    
    // For other users, check if admin loading is complete
    if (adminLoading) {
      console.log('⏳ RouteGuard: Admin check still loading for non-designated user');
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-coral" />
          <p className="mt-4 text-gray-600">Verificando permissões administrativas...</p>
        </div>
      );
    }
    
    if (!isAdmin) {
      console.log('❌ RouteGuard: Non-admin user attempting to access admin route, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log('✅ RouteGuard: Admin access granted for verified user');
  }
  
  // User is authenticated and has required permissions
  console.log('✅ RouteGuard: Access granted to route', {
    path: location.pathname,
    userEmail: user?.email
  });
  return <Outlet />;
};

export default RouteGuard;
