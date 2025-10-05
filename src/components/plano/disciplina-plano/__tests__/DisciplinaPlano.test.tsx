import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import DisciplinaPlano from '../DisciplinaPlano';
import type { DisciplinaInfo } from '../types';

// Mocks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      }))
    }))
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockDisciplina: DisciplinaInfo = {
  id: '1',
  nome: 'Matemática',
  itens: [
    {
      id: '1',
      topico: {
        id: '1',
        nome: 'Álgebra',
        disciplina: { id: '1', nome: 'Matemática' }
      },
      prioridade: 1,
      status: 'pendente',
      tipo: 'video',
      origem: 'diagnostico'
    },
    {
      id: '2',
      topico: {
        id: '2',
        nome: 'Geometria',
        disciplina: { id: '1', nome: 'Matemática' }
      },
      prioridade: 2,
      status: 'concluido',
      tipo: 'exercicio',
      origem: 'simulado'
    }
  ]
};

describe('DisciplinaPlano', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render discipline name and items', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <DisciplinaPlano disciplina={mockDisciplina} filtroStatus={null} />
      </Wrapper>
    );

    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('Geometria')).toBeInTheDocument();
  });

  it('should not render when no items match filter', () => {
    const Wrapper = createWrapper();
    
    const { container } = render(
      <Wrapper>
        <DisciplinaPlano disciplina={mockDisciplina} filtroStatus="inexistente" />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render only filtered items', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <DisciplinaPlano disciplina={mockDisciplina} filtroStatus="pendente" />
      </Wrapper>
    );

    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.queryByText('Geometria')).not.toBeInTheDocument();
  });

  it('should show diagnostic badges correctly', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <DisciplinaPlano disciplina={mockDisciplina} filtroStatus={null} />
      </Wrapper>
    );

    expect(screen.getByText('Diagnóstico')).toBeInTheDocument();
  });
}); 