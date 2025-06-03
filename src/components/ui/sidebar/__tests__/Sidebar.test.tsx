import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, useSidebar } from '../index'

// Mock do hook useIsMobile
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}))

// Componente de teste para verificar o contexto
const TestComponent = () => {
  const { state, toggleSidebar } = useSidebar()
  return (
    <div>
      <span data-testid="sidebar-state">{state}</span>
      <button onClick={toggleSidebar} data-testid="toggle-button">
        Toggle
      </button>
    </div>
  )
}

describe('Sidebar Components', () => {
  it('should render SidebarProvider with default state', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('expanded')
  })

  it('should toggle sidebar state when trigger is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <SidebarProvider>
        <TestComponent />
        <SidebarTrigger />
      </SidebarProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    const stateDisplay = screen.getByTestId('sidebar-state')

    expect(stateDisplay).toHaveTextContent('expanded')

    await user.click(toggleButton)
    expect(stateDisplay).toHaveTextContent('collapsed')

    await user.click(toggleButton)
    expect(stateDisplay).toHaveTextContent('expanded')
  })

  it('should render Sidebar with content', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <div data-testid="sidebar-content">Test Content</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
  })

  it('should render SidebarTrigger with correct attributes', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('data-sidebar', 'trigger')
    expect(trigger).toHaveClass('h-7', 'w-7')
  })

  it('should throw error when useSidebar is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSidebar must be used within a SidebarProvider.')

    console.error = originalError
  })
}) 