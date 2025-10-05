import React from 'react';
import DisciplineProgressItem from './DisciplineProgressItem';

import EmptyState from './EmptyState';
import { GraduationCap } from 'lucide-react';

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
    <div className="col-span-1 md:col-span-2 lg:col-span-1">
      <div className="bg-white p-4 rounded-lg border border-gray-100 h-full">
        <h3 className="font-semibold text-lg mb-4">Progresso por Disciplina</h3>
        
        {!hasDisciplines ? (
          <EmptyState 
            message="Comece sua trilha de aprendizado hoje!"
            icon={<GraduationCap className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-4">
            {disciplines.map((item) => (
              <DisciplineProgressItem 
                key={item.discipline_name}
                name={item.discipline_name}
                topicsCompleted={item.topics_completed}
                totalTopics={item.total_topics}
                completionPercentage={item.completion_percentage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisciplineProgress;
