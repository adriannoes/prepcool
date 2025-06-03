import React from 'react'
import { Brain } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EmptyState from '../EmptyState'
import LoadingSpinner from '../LoadingSpinner'
import { StudyPlanData, StudyPlanCardState, StudyPlanCardActions } from './types'

interface StudyPlanCardContentProps {
  state: StudyPlanCardState
  planItems: StudyPlanData | undefined
  recommendedTopics: number
  actions: StudyPlanCardActions
}

export const StudyPlanCardContent: React.FC<StudyPlanCardContentProps> = ({
  state,
  planItems,
  recommendedTopics,
  actions
}) => {
  const renderLoadingState = () => (
    <div className="flex justify-center py-6">
      <LoadingSpinner size="sm" />
    </div>
  )

  const renderDataState = () => (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            Plano personalizado disponível
          </h3>
          <p className="text-gray-600">
            {recommendedTopics} tópicos recomendados com base no seu desempenho
          </p>
        </div>
        <Badge 
          className="mt-2 sm:mt-0 text-sm bg-coral/10 text-coral border-none px-3 py-1"
        >
          Atualizado
        </Badge>
      </div>
      
      {planItems?.pendingItems && planItems.pendingItems.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Próximos tópicos:</h4>
          <ul className="space-y-1">
            {planItems.pendingItems.map((item) => (
              <li key={item.id} className="text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-coral"></span>
                <span>{item.topico?.nome || 'Tópico'}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {item.tipo === 'video' ? 'Vídeo' : 'Exercício'}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderEmptyState = () => (
    <div className="py-4">
      <EmptyState 
        message="🧠 Você ainda não tem um plano de estudos! Faça um simulado para gerar recomendações personalizadas."
        icon={<Brain className="h-6 w-6" />}
        className="bg-[#F6F6F7] mt-2"
        ctaLabel="Gerar meu plano de estudos"
        onCtaClick={actions.handleGeneratePlan}
        ctaIcon={<Brain className="h-4 w-4" />}
      />
    </div>
  )

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return renderLoadingState()
      case 'hasData':
        return renderDataState()
      case 'empty':
        return renderEmptyState()
      default:
        return renderEmptyState()
    }
  }

  return (
    <CardContent>
      {renderContent()}
    </CardContent>
  )
} 