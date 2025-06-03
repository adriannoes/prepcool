import React from 'react'
import { TrendingUp } from 'lucide-react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const StudyPlanCardHeader: React.FC = () => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle>Plano de Estudos</CardTitle>
        <CardDescription>Recomendações personalizadas</CardDescription>
      </div>
      <TrendingUp className="h-6 w-6 text-coral" />
    </CardHeader>
  )
} 