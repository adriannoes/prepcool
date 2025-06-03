import React from 'react'
import { Card } from '@/components/ui/card'
import { StudyPlanCardHeader } from './StudyPlanCardHeader'
import { StudyPlanCardContent } from './StudyPlanCardContent'
import { StudyPlanCardFooter } from './StudyPlanCardFooter'
import { useStudyPlanData } from './useStudyPlanData'
import { StudyPlanCardProps } from './types'

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ className }) => {
  const {
    planItems,
    state,
    hasStudyPlan,
    recommendedTopics,
    actions
  } = useStudyPlanData()

  return (
    <Card className={`col-span-1 md:col-span-2 h-full ${className || ''}`}>
      <StudyPlanCardHeader />
      <StudyPlanCardContent
        state={state}
        planItems={planItems}
        recommendedTopics={recommendedTopics}
        actions={actions}
      />
      <StudyPlanCardFooter
        hasStudyPlan={hasStudyPlan}
        actions={actions}
      />
    </Card>
  )
} 