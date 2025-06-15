import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock do useAdminCheck
vi.mock('@/hooks/useAdminCheck', () => ({
  useAdminCheck: () => {
    console.log('🧪 [TEST] useAdminCheck chamado para dev@dev.com');
    return { isAdmin: true, loading: false };
  },
}));

// Mock do Supabase para simular usuário autenticado
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        getSession: vi.fn(async () => ({
          data: {
            session: {
              user: { email: 'dev@dev.com', id: '123', aud: 'authenticated' },
            },
          },
        })),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

// Mock do AdminDashboard para facilitar a asserção
vi.mock('../AdminDashboard', () => ({
  __esModule: true,
  default: () => {
    console.log('🧪 [TEST] AdminDashboard renderizado');
    return <div data-testid="admin-dashboard">Painel Admin</div>;
  },
}));

import RouteGuard from '../../RouteGuard';
import AdminDashboard from '../AdminDashboard';


describe('Acesso admin para dev@dev.com', () => {
  it('deve permitir acesso à rota /admin e renderizar o painel admin', async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route element={<RouteGuard requiresAuth={true} requiresAdmin={true} />}> 
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            <Route path="/unauthorized" element={<div data-testid="unauthorized-page">Unauthorized</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Espera o painel admin aparecer
    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
    // Garante que não houve redirecionamento
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument();
    // Log para depuração
    console.log('🧪 [TEST] Teste de acesso admin finalizado com sucesso');
  });
}); 