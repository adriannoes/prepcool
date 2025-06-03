import React from 'react'
import { LayoutDashboard } from 'lucide-react'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudyPlanCardActions } from './types'

interface StudyPlanCardFooterProps {
  hasStudyPlan: boolean
  actions: StudyPlanCardActions
}

export const StudyPlanCardFooter: React.FC<StudyPlanCardFooterProps> = ({
  hasStudyPlan,
  actions
}) => {
  return (
    <CardFooter>
      <Button 
        className="w-full h-12 bg-coral hover:bg-coral/90 text-white rounded-md px-4 py-2"
        disabled={!hasStudyPlan}
        onClick={actions.handleViewPlan}
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Ver Plano de Estudos
      </Button>
    </CardFooter>
  )
} 