
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔍 useAdminCheck: Starting admin check for user:', user?.email);
    
    // Immediate check for designated admin
    if (user?.email === 'dev@dev.com') {
      console.log('✅ useAdminCheck: ADMIN ACCESS GRANTED - Designated admin detected');
      setIsAdmin(true);
      setLoading(false);
      return;
    }
    
    // For non-admin or no user
    if (!user) {
      console.log('❌ useAdminCheck: No user, setting admin false');
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    // For other users, default to false (we can add DB check later if needed)
    console.log('❌ useAdminCheck: Not designated admin, access denied');
    setIsAdmin(false);
    setLoading(false);
  }, [user]);

  console.log('🎯 useAdminCheck: Final state', { 
    isAdmin, 
    loading, 
    userEmail: user?.email 
  });
  
  return { isAdmin, loading };
};
