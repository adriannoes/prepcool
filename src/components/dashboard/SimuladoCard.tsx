
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
    <Card className="h-full flex flex-col bg-white rounded-2xl shadow-md border-0 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Simulados</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Suas provas e exercícios
            </CardDescription>
          </div>
          <div className="bg-coral/10 p-3 rounded-2xl">
            <Award className="h-8 w-8 text-coral" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow px-8 py-4">
        {hasNoSimulados ? (
          <EmptyState 
            message="Você ainda não fez nenhum simulado. Que tal começar agora?"
            icon={<Award className="h-6 w-6" />}
            className="bg-gray-50 border-gray-200 border-dashed rounded-xl p-6" 
          />
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-coral mb-2">{completed}</div>
            <div className="text-lg text-gray-600 mb-6">de {total} simulados completados</div>
            
            {total > 0 && (
              <div className="space-y-2">
                <Progress 
                  value={percentCompleted}
                  showPercentage={true}
                  className="w-full h-2"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-8 pt-4">
        <Button 
          className="w-full h-12 bg-coral hover:bg-coral/90 text-white rounded-xl px-6 py-3 font-semibold text-base transition-all duration-200"
          asChild
        >
          <Link to="/simulado">
            <Award className="mr-2 h-5 w-5" />
            Praticar Simulados
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimuladoCard;
