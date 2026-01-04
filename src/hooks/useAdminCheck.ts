import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { error as logError } from '@/utils/logger';

// Cache admin status in memory for the session
const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = adminStatusCache.get(user.id);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setIsAdmin(cached.isAdmin);
      setLoading(false);
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);

    const verifyAdmin = async () => {
      try {
        // Get the current session to retrieve the JWT token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Call the verify-admin Edge Function
        const { data, error } = await supabase.functions.invoke('verify-admin', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal,
        });

        if (signal.aborted) {
          return; // Request was cancelled
        }

        if (error) {
          logError('Error verifying admin status:', error);
          // Fail-secure: default to non-admin on error
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const adminStatus = data?.isAdmin === true;
        setIsAdmin(adminStatus);
        
        // Update cache
        adminStatusCache.set(user.id, {
          isAdmin: adminStatus,
          timestamp: now,
        });

      } catch (error) {
        if (signal.aborted) {
          return; // Request was cancelled
        }
        
        logError('Error in admin check:', error);
        // Fail-secure: default to non-admin on error
        setIsAdmin(false);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    verifyAdmin();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]);

  return { isAdmin, loading };
};
