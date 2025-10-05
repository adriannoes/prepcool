
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔍 useAdminCheck: Checking admin status for:', user?.email);
    
    // Verificação simples e direta
    const adminStatus = user?.email === 'dev@dev.com';
    setIsAdmin(adminStatus);
    setLoading(false);
    
    console.log('✅ useAdminCheck: Admin check complete', { 
      userEmail: user?.email,
      isAdmin: adminStatus,
      loading: false
    });
  }, [user?.email]); // Dependência mais específica

  return { isAdmin, loading };
};
