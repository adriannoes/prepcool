
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';
import { log } from '@/utils/logger';

interface RouteGuardProps {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const RouteGuard = ({ requiresAuth = true, requiresAdmin = false }: RouteGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  
  // Log route check without sensitive user data
  log('🛡️ RouteGuard: Route check', {
    path: location.pathname,
    requiresAuth,
    requiresAdmin,
    hasUser: !!user,
    authLoading,
    adminLoading,
    isAdmin
  });

  // Para rotas que não precisam de autenticação
  if (!requiresAuth) {
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      log('🔄 RouteGuard: Authenticated user on auth page, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }
  
  // Se ainda carregando auth, mostrar loading
  if (authLoading) {
    log('⏳ RouteGuard: Auth loading, showing spinner');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Carregando autenticação...</p>
      </div>
    );
  }
  
  // Se não tem usuário, redirecionar para login
  if (!user) {
    log('❌ RouteGuard: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Para rotas admin
  if (requiresAdmin) {
    // Verificar se ainda está carregando o status de admin
    if (adminLoading) {
      log('⏳ RouteGuard: Admin check loading');
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-coral" />
          <p className="mt-4 text-gray-600">Verificando permissões administrativas...</p>
        </div>
      );
    }
    
    // Se não é admin, negar acesso
    if (!isAdmin) {
      log('❌ RouteGuard: Non-admin access denied, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  log('✅ RouteGuard: Access granted to', location.pathname);
  return <Outlet />;
};

export default RouteGuard;
