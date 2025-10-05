
import React from 'react';
import { TrendingUp, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StudyPlanCard = () => {
  // This would come from the API in a real implementation
  const hasStudyPlan = false; 
  const recommendedTopics = 0;
  
  return (
    <Card className="col-span-1 md:col-span-2 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Plano de Estudos</CardTitle>
          <CardDescription>Recomendações personalizadas</CardDescription>
        </div>
        <TrendingUp className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        {hasStudyPlan ? (
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
                className="mt-2 sm:mt-0 text-sm bg-[#5E60CE]/10 text-[#5E60CE] border-none px-3 py-1"
              >
                Atualizado
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Estamos analisando seu desempenho para criar um plano personalizado.
            </p>
            <Badge className="text-sm px-3 py-1 bg-gray-100 text-gray-600">
              Em breve
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white rounded-md px-4 py-2"
          disabled={!hasStudyPlan}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Ver Plano de Estudos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanCard;
