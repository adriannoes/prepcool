
import React from 'react';
import { Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SimuladoCardProps {
  completed: number;
  total: number;
}

const SimuladoCard = ({ completed, total }: SimuladoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Simulados</CardTitle>
          <CardDescription>Suas provas e exercícios</CardDescription>
        </div>
        <Award className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className="text-4xl font-bold text-[#5E60CE]">{completed}</div>
          <div className="text-gray-500">de {total} simulados completados</div>
          
          {total > 0 && (
            <Progress 
              value={(completed / total) * 100}
              className="w-full mt-4 h-2"
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
          <Award className="mr-2 h-4 w-4" />
          Praticar Simulados
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimuladoCard;
