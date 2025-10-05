
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DisciplineProgressItem from './DisciplineProgressItem';
import EmptyState from './EmptyState';
import { GraduationCap, BookOpen } from 'lucide-react';

interface DisciplineProgressProps {
  disciplines: DisciplineProgressData[];
}

export interface DisciplineProgressData {
  discipline_name: string;
  topics_completed: number;
  total_topics: number;
  completion_percentage: number;
}

const DisciplineProgress = ({ disciplines }: DisciplineProgressProps) => {
  const hasDisciplines = disciplines && disciplines.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border-0 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Progresso por Disciplina</h3>
          <p className="text-base text-gray-600">Acompanhe seu avanço em cada matéria</p>
        </div>
        <div className="bg-coral/10 p-3 rounded-2xl">
          <GraduationCap className="h-8 w-8 text-coral" />
        </div>
      </div>
      
      {!hasDisciplines ? (
        <div className="py-12">
          <EmptyState 
            message="Comece sua trilha de aprendizado hoje!"
            icon={<GraduationCap className="h-6 w-6" />}
            className="bg-gray-50 border-gray-200 border-dashed rounded-xl p-8"
          />
          <div className="flex justify-center mt-8">
            <Link to="/aprendizado">
              <Button 
                className="bg-coral hover:bg-coral/90 text-white rounded-xl px-8 py-3 h-12 font-semibold text-base"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Começar Aprendizado
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disciplines.map((item) => (
              <DisciplineProgressItem 
                key={item.discipline_name}
                name={item.discipline_name}
                topicsCompleted={item.topics_completed}
                totalTopics={item.total_topics}
                completionPercentage={item.completion_percentage}
                linkToDiscipline={`/aprendizado?disciplina=${encodeURIComponent(item.discipline_name)}`}
              />
            ))}
          </div>
          
          <div className="pt-6 mt-8 border-t border-gray-100 flex justify-center">
            <Link to="/aprendizado">
              <Button 
                variant="outline"
                className="border-coral text-coral hover:bg-coral/10 hover:border-coral rounded-xl px-8 py-3 h-12 font-semibold text-base"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Acessar Trilha de Aprendizado
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplineProgress;
