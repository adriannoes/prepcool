// Tipos para o sistema de plano de estudos
export interface StudyPlanItem {
  id: string
  usuario_id: string
  topico_id: string
  status: string // Mais flexível para aceitar valores do banco
  tipo: string // Mais flexível para aceitar valores do banco
  prioridade: number
  origem: string // Campo que existe no banco
  created_at: string
  topico?: StudyPlanTopic
}

export interface StudyPlanTopic {
  id: string
  nome: string
  disciplina_id: string
  created_at: string
}

export interface StudyPlanData {
  count: number
  pendingItems: StudyPlanItem[]
}

export interface StudyPlanCardProps {
  className?: string
}

// Estados do componente
export type StudyPlanCardState = 'loading' | 'hasData' | 'empty'

// Ações do card
export interface StudyPlanCardActions {
  handleGeneratePlan: () => void
  handleViewPlan: () => void
}

// Tipos mais específicos para uso interno (opcionais)
export type StudyPlanStatus = 'pendente' | 'em_progresso' | 'concluido'
export type StudyPlanType = 'video' | 'exercicio' 