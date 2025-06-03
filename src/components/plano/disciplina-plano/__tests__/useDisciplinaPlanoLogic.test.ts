import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useDisciplinaPlanoLogic } from '../useDisciplinaPlanoLogic';
import type { DisciplinaInfo } from '../types';

// Mocks
vi.mock('react-router-dom');
vi.mock('@tanstack/react-query');
vi.mock('@/hooks/use-toast');
vi.mock('@/integrations/supabase/client');

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockMutate = vi.fn();

const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

beforeEach(() => {
  vi.clearAllMocks();
  (useNavigate as any).mockReturnValue(mockNavigate);
  (useToast as any).mockReturnValue({ toast: mockToast });
  (useQueryClient as any).mockReturnValue(mockQueryClient);
  (useMutation as any).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });
});

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

describe('useDisciplinaPlanoLogic', () => {
  it('should return all items when no filter is applied', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: null })
    );

    expect(result.current.itensExibidos).toHaveLength(2);
    expect(result.current.shouldRender).toBe(true);
  });

  it('should filter items by status when filter is applied', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: 'pendente' })
    );

    expect(result.current.itensExibidos).toHaveLength(1);
    expect(result.current.itensExibidos[0].status).toBe('pendente');
    expect(result.current.shouldRender).toBe(true);
  });

  it('should return shouldRender false when no items match filter', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: 'inexistente' })
    );

    expect(result.current.itensExibidos).toHaveLength(0);
    expect(result.current.shouldRender).toBe(false);
  });

  it('should navigate to video content correctly', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: null })
    );

    const videoItem = mockDisciplina.itens[0];
    act(() => {
      result.current.navigateToItem(videoItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/aprendizado?topico=1');
  });

  it('should navigate to exercise content correctly', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: null })
    );

    const exerciseItem = mockDisciplina.itens[1];
    act(() => {
      result.current.navigateToItem(exerciseItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/simulado?disciplina=1');
  });

  it('should call mutation when marking item as completed', () => {
    const { result } = renderHook(() => 
      useDisciplinaPlanoLogic({ disciplina: mockDisciplina, filtroStatus: null })
    );

    act(() => {
      result.current.marcarComoConcluido('1');
    });

    expect(mockMutate).toHaveBeenCalledWith('1');
  });
}); 