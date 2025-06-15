import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { StudyPlanData, StudyPlanCardState, StudyPlanCardActions } from './types'

export interface UseStudyPlanDataReturn {
  // Data
  planItems: StudyPlanData | undefined
  isLoading: boolean
  error: Error | null
  
  // Computed state
  state: StudyPlanCardState
  hasStudyPlan: boolean
  recommendedTopics: number
  
  // Actions
  actions: StudyPlanCardActions
}

export const useStudyPlanData = (): UseStudyPlanDataReturn => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: planItems, isLoading, error } = useQuery({
    queryKey: ['study-plan-preview'],
    queryFn: async (): Promise<StudyPlanData> => {
      if (!user) return { count: 0, pendingItems: [] }
      
      // Get count of study plan items
      const { count, error: countError } = await supabase
        .from('plano_estudo')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('status', 'pendente')
        
      if (countError) throw countError
      
      // Get a few recent items for preview
      const { data: pendingItems, error: itemsError } = await supabase
        .from('plano_estudo')
        .select('*, topico(*)')
        .eq('usuario_id', user.id)
        .eq('status', 'pendente')
        .order('prioridade', { ascending: true })
        .limit(3)
        
      if (itemsError) throw itemsError
      
      return { count: count || 0, pendingItems: pendingItems || [] }
    },
    enabled: !!user,
  })
  
  // Computed values
  const hasStudyPlan = !isLoading && planItems && planItems.count > 0
  const recommendedTopics = planItems?.count || 0
  
  // State determination
  const state: StudyPlanCardState = isLoading 
    ? 'loading' 
    : hasStudyPlan 
      ? 'hasData' 
      : 'empty'
  
  // Actions
  const handleGeneratePlan = () => {
    // Redireciona para o diagnóstico para gerar o plano de estudos
    navigate('/diagnostico')
  }
  
  const handleViewPlan = () => {
    navigate('/plano')
  }
  
  const actions: StudyPlanCardActions = {
    handleGeneratePlan,
    handleViewPlan
  }
  
  return {
    planItems,
    isLoading,
    error,
    state,
    hasStudyPlan,
    recommendedTopics,
    actions
  }
} 