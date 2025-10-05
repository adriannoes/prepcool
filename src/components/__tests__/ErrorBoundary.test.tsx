import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Componente que lança erro
function ErrorComponent() {
  throw new Error('Test error');
}

// Componente normal
function NormalComponent() {
  return <div>Normal content</div>;
}

// Componente que lança erro sob demanda
function ErrorOnClickComponent() {
  const [shouldError, setShouldError] = React.useState(false);

  if (shouldError) {
    throw new Error('Button triggered error');
  }

  return (
    <button onClick={() => setShouldError(true)} data-testid="error-button">
      Trigger Error
    </button>
  );
}

describe('ErrorBoundary', () => {
  // Mock console.error para evitar poluição dos logs de teste
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    // Temporariamente alterar NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Detalhes do erro')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('should retry when retry button is clicked', async () => {
    render(
      <ErrorBoundary>
        <ErrorOnClickComponent />
      </ErrorBoundary>
    );

    // Trigger error
    fireEvent.click(screen.getByTestId('error-button'));

    // Verify error UI is shown
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByText('Tentar novamente'));

    // Verify normal component is rendered again
    await waitFor(() => {
      expect(screen.getByTestId('error-button')).toBeInTheDocument();
    });
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
  });
});
