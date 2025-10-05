
import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Admin = () => {
  // RouteGuard já verificou autenticação e permissão admin
  // então podemos renderizar diretamente o dashboard
  console.log('✅ Admin page: Rendering admin dashboard');
  return <AdminDashboard />;
};

export default Admin;
