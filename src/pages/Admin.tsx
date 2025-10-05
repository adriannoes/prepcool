
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated and is the admin
  if (!user || user.email !== 'esadrianno@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboard />;
};

export default Admin;
