
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useAdminCheck: Starting admin check for user:', user?.id, user?.email);
      
      if (!user) {
        console.log('❌ useAdminCheck: No user found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 useAdminCheck: Calling is_admin() RPC function');
        const { data, error } = await supabase.rpc('is_admin');
        
        console.log('📊 useAdminCheck: RPC response - data:', data, 'error:', error);
        
        if (error) {
          console.error('❌ useAdminCheck: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          console.log('✅ useAdminCheck: Admin status result:', data);
          setIsAdmin(data || false);
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

  console.log('🎯 useAdminCheck: Current state - isAdmin:', isAdmin, 'loading:', loading);
  
  return { isAdmin, loading };
};
