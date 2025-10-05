
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useAdminCheck: Starting admin check');
      console.log('👤 Current user:', { 
        id: user?.id, 
        email: user?.email,
        authenticated: !!user 
      });
      
      if (!user) {
        console.log('❌ useAdminCheck: No authenticated user found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Verificação dupla: role-based (principal) + email fallback
        console.log('🔍 useAdminCheck: Calling is_admin() RPC function');
        const { data: hasAdminRole, error: rpcError } = await supabase.rpc('is_admin');
        
        console.log('📊 useAdminCheck: RPC response', { 
          data: hasAdminRole, 
          error: rpcError 
        });

        // Log adicional para debug da função RPC
        if (rpcError) {
          console.error('🚨 useAdminCheck: RPC Error details:', {
            message: rpcError.message,
            details: rpcError.details,
            hint: rpcError.hint,
            code: rpcError.code
          });
        }

        // Verificação por email como fallback (dev@dev.com é o admin designado)
        const isDesignatedAdmin = user.email === 'dev@dev.com';
        console.log('📧 useAdminCheck: Email check', { 
          userEmail: user.email, 
          isDesignatedAdmin 
        });

        // Verificar se usuário existe na tabela user_roles
        console.log('🔍 useAdminCheck: Checking user_roles table manually');
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        console.log('📋 useAdminCheck: User roles query result', {
          userRoles,
          rolesError,
          userId: user.id
        });

        if (rpcError) {
          console.error('❌ useAdminCheck: RPC error, falling back to email check:', rpcError);
          // Se RPC falhar, usar apenas verificação por email
          setIsAdmin(isDesignatedAdmin);
        } else {
          // Combinar verificações: deve ter role admin OU ser o email designado
          const finalAdminStatus = hasAdminRole || isDesignatedAdmin;
          console.log('✅ useAdminCheck: Final admin status', {
            hasAdminRole,
            isDesignatedAdmin,
            finalResult: finalAdminStatus,
            userRolesFound: userRoles?.length || 0
          });
          setIsAdmin(finalAdminStatus);
        }
      } catch (error) {
        console.error('❌ useAdminCheck: Exception during admin check:', error);
        // Em caso de erro, fazer fallback para verificação por email
        const isDesignatedAdmin = user.email === 'dev@dev.com';
        console.log('🔄 useAdminCheck: Using email fallback due to exception:', isDesignatedAdmin);
        setIsAdmin(isDesignatedAdmin);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log('🎯 useAdminCheck: Final state', { 
    isAdmin, 
    loading, 
    userEmail: user?.email 
  });
  
  return { isAdmin, loading };
};
