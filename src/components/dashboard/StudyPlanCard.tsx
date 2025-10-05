
import React from 'react';
import { TrendingUp, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StudyPlanCard = () => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Plano de Estudos</CardTitle>
          <CardDescription>Recomendações personalizadas</CardDescription>
        </div>
        <TrendingUp className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2">
            Estamos analisando seu desempenho para criar um plano personalizado.
          </p>
          <Badge>Em breve</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Ver Plano de Estudos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanCard;
