import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { StudyPlanCard } from '../StudyPlanCard'
import { StudyPlanCardHeader } from '../StudyPlanCardHeader'
import { StudyPlanCardContent } from '../StudyPlanCardContent'
import { StudyPlanCardFooter } from '../StudyPlanCardFooter'

// Mock do contexto de autenticação
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}))

// Mock do supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}))

// Mock dos componentes de UI específicos
vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}))

vi.mock('../EmptyState', () => ({
  default: ({ message, onCtaClick }: { message: string; onCtaClick?: () => void }) => (
    <div data-testid="empty-state">
      <span>{message}</span>
      {onCtaClick && (
        <button onClick={onCtaClick} data-testid="empty-state-cta">
          Generate Plan
        </button>
      )}
    </div>
  )
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('StudyPlanCard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('StudyPlanCardHeader', () => {
    it('should render header with correct title and icon', () => {
      render(<StudyPlanCardHeader />)
      
      expect(screen.getByText('Plano de Estudos')).toBeInTheDocument()
      expect(screen.getByText('Recomendações personalizadas')).toBeInTheDocument()
    })
  })

  describe('StudyPlanCardContent', () => {
    const mockActions = {
      handleGeneratePlan: vi.fn(),
      handleViewPlan: vi.fn()
    }

    it('should render loading state', () => {
      render(
        <StudyPlanCardContent
          state="loading"
          planItems={undefined}
          recommendedTopics={0}
          actions={mockActions}
        />
      )
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should render empty state with CTA', async () => {
      const user = userEvent.setup()
      
      render(
        <StudyPlanCardContent
          state="empty"
          planItems={undefined}
          recommendedTopics={0}
          actions={mockActions}
        />
      )
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/ainda não tem um plano de estudos/)).toBeInTheDocument()
      
      const ctaButton = screen.getByTestId('empty-state-cta')
      await user.click(ctaButton)
      
      expect(mockActions.handleGeneratePlan).toHaveBeenCalledOnce()
    })

    it('should render data state with study plan information', () => {
      const mockPlanItems = {
        count: 5,
        pendingItems: [
          {
            id: '1',
            usuario_id: 'test-user',
            topico_id: 'topico-1',
            status: 'pendente',
            tipo: 'video',
            prioridade: 1,
            origem: 'diagnostico',
            created_at: '2024-01-01',
            topico: { id: 'topico-1', nome: 'Matemática Básica', disciplina_id: 'mat-1', created_at: '2024-01-01' }
          }
        ]
      }
      
      render(
        <StudyPlanCardContent
          state="hasData"
          planItems={mockPlanItems}
          recommendedTopics={5}
          actions={mockActions}
        />
      )
      
      expect(screen.getByText('Plano personalizado disponível')).toBeInTheDocument()
      expect(screen.getByText('5 tópicos recomendados com base no seu desempenho')).toBeInTheDocument()
      expect(screen.getByText('Matemática Básica')).toBeInTheDocument()
      expect(screen.getByText('Vídeo')).toBeInTheDocument()
    })
  })

  describe('StudyPlanCardFooter', () => {
    const mockActions = {
      handleGeneratePlan: vi.fn(),
      handleViewPlan: vi.fn()
    }

    it('should render button enabled when has study plan', async () => {
      const user = userEvent.setup()
      
      render(
        <StudyPlanCardFooter
          hasStudyPlan={true}
          actions={mockActions}
        />
      )
      
      const button = screen.getByRole('button', { name: /Ver Plano de Estudos/ })
      expect(button).toBeEnabled()
      
      await user.click(button)
      expect(mockActions.handleViewPlan).toHaveBeenCalledOnce()
    })

    it('should render button disabled when no study plan', () => {
      render(
        <StudyPlanCardFooter
          hasStudyPlan={false}
          actions={mockActions}
        />
      )
      
      const button = screen.getByRole('button', { name: /Ver Plano de Estudos/ })
      expect(button).toBeDisabled()
    })
  })

  describe('StudyPlanCard Integration', () => {
    it('should render complete card with mocked data', async () => {
      const Wrapper = createWrapper()
      
      render(
        <Wrapper>
          <StudyPlanCard />
        </Wrapper>
      )
      
      // Should show header
      expect(screen.getByText('Plano de Estudos')).toBeInTheDocument()
      
      // Should initially show loading, then transition to content
      await waitFor(() => {
        // Since our mock returns empty data, it should show empty state
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })
  })
}) 