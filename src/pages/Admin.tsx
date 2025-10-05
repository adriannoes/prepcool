
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  console.log('🏛️ Admin page - Auth state:', { 
    user: user?.email, 
    userId: user?.id,
    authLoading, 
    isAdmin, 
    adminLoading 
  });

  if (authLoading || adminLoading) {
    console.log('⏳ Admin page: Still loading...');
    return <LoadingSpinner />;
  }

  // Check if user is authenticated
  if (!user) {
    console.log('🚫 Admin page: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (!isAdmin) {
    console.log('🚫 Admin page: User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Admin page: User has admin access, rendering dashboard');
  return <AdminDashboard />;
};

export default Admin;
