
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DisciplineProgressItem from './DisciplineProgressItem';

export interface DisciplineProgressData {
  discipline_name: string;
  topics_completed: number;
  total_topics: number;
  completion_percentage: number;
}

interface DisciplineProgressProps {
  disciplines: DisciplineProgressData[];
}

const DisciplineProgress = ({ disciplines }: DisciplineProgressProps) => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Trilha de Aprendizado</CardTitle>
          <CardDescription>Seu progresso por disciplina</CardDescription>
        </div>
        <BookOpen className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        {disciplines.length > 0 ? (
          <div className="space-y-4">
            {disciplines.map((discipline, index) => (
              <DisciplineProgressItem
                key={index}
                name={discipline.discipline_name}
                topicsCompleted={discipline.topics_completed}
                totalTopics={discipline.total_topics}
                completionPercentage={discipline.completion_percentage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma disciplina encontrada ou progresso disponível.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/aprendizado" className="w-full">
          <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90">
            <BookOpen className="mr-2 h-4 w-4" />
            Acessar Trilha de Aprendizado
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DisciplineProgress;
