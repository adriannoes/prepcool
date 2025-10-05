
import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import EmptyState from './EmptyState';

interface SimuladoCardProps {
  completed: number;
  total: number;
}

const SimuladoCard = ({ completed, total }: SimuladoCardProps) => {
  const percentCompleted = total > 0 ? (completed / total) * 100 : 0;
  const hasNoSimulados = completed === 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Simulados</CardTitle>
          <CardDescription>Suas provas e exercícios</CardDescription>
        </div>
        <Award className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent className="flex-grow">
        {hasNoSimulados ? (
          <EmptyState 
            message="Você ainda não fez nenhum simulado. Que tal começar agora?"
            icon={<Award className="h-5 w-5" />}
            className="mt-2" 
          />
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold text-[#5E60CE]">{completed}</div>
            <div className="text-gray-500 mb-4">de {total} simulados completados</div>
            
            {total > 0 && (
              <Progress 
                value={percentCompleted}
                showPercentage={true}
                className="w-full mt-2"
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white rounded-md px-4 py-2"
          asChild
        >
          <Link to="/simulado">
            <Award className="mr-2 h-4 w-4" />
            Praticar Simulados
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimuladoCard;
