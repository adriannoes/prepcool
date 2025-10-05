
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

      // Para dev@dev.com, verificação imediata por email (mais rápida e confiável)
      const isDesignatedAdmin = user.email === 'dev@dev.com';
      if (isDesignatedAdmin) {
        console.log('✅ useAdminCheck: Designated admin confirmed by email - immediate access');
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Para outros usuários, verificar role no banco de dados
      try {
        console.log('🔍 useAdminCheck: Checking user_roles table for other users');
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        console.log('📋 useAdminCheck: User roles query result', {
          userRoles,
          rolesError,
          userId: user.id
        });

        if (rolesError) {
          console.error('❌ useAdminCheck: Error querying user roles:', rolesError);
          setIsAdmin(false);
        } else {
          const hasAdminRole = userRoles?.some(roleRow => roleRow.role === 'admin') || false;
          console.log('✅ useAdminCheck: Role-based admin check', {
            hasAdminRole,
            userRolesFound: userRoles?.length || 0
          });
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        console.error('❌ useAdminCheck: Exception during admin check:', error);
        setIsAdmin(false);
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
