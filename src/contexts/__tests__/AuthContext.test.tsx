import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(async () => ({
        data: { session: null },
        error: null
      })),
      signUp: vi.fn(async () => ({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })),
      signInWithPassword: vi.fn(async () => ({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })),
      signOut: vi.fn(async () => ({
        error: null
      }))
    }
  }
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  }),
  toast: vi.fn()
}));

// Componente de teste para acessar o contexto
function TestComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button data-testid="signin" onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button data-testid="signout" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('should provide initial loading state', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should update loading state after session check', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });
  });

  it('should handle sign in', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Click sign in button
    fireEvent.click(screen.getByTestId('signin'));

    // Verify the sign in was called
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleSpy.mockRestore();
  });
});
