
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
  
  console.log('🛡️ RouteGuard: Route check', {
    path: location.pathname,
    requiresAuth,
    requiresAdmin,
    userEmail: user?.email,
    authLoading,
    adminLoading,
    isAdmin
  });

  // Para rotas que não precisam de autenticação
  if (!requiresAuth) {
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log('🔄 RouteGuard: Authenticated user on auth page, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }
  
  // Se ainda carregando auth, mostrar loading
  if (authLoading) {
    console.log('⏳ RouteGuard: Auth loading, showing spinner');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-coral" />
        <p className="mt-4 text-gray-600">Carregando autenticação...</p>
      </div>
    );
  }
  
  // Se não tem usuário, redirecionar para login
  if (!user) {
    console.log('❌ RouteGuard: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Para rotas admin
  if (requiresAdmin) {
    // ACESSO DIRETO para dev@dev.com - sem esperar loading
    if (user.email === 'dev@dev.com') {
      console.log('✅ RouteGuard: DIRECT ADMIN ACCESS for dev@dev.com');
      return <Outlet />;
    }
    
    // Para outros usuários, verificar se ainda está carregando
    if (adminLoading) {
      console.log('⏳ RouteGuard: Admin check loading for non-dev user');
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-coral" />
          <p className="mt-4 text-gray-600">Verificando permissões administrativas...</p>
        </div>
      );
    }
    
    // Se não é admin, negar acesso
    if (!isAdmin) {
      console.log('❌ RouteGuard: Non-admin access denied, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  console.log('✅ RouteGuard: Access granted to', location.pathname);
  return <Outlet />;
};

export default RouteGuard;
