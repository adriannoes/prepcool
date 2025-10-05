
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DisciplineProgressItemProps {
  name: string;
  topicsCompleted: number;
  totalTopics: number;
  completionPercentage: number;
}

const DisciplineProgressItem = ({
  name,
  topicsCompleted,
  totalTopics,
  completionPercentage,
}: DisciplineProgressItemProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span>{topicsCompleted} de {totalTopics} tópicos</span>
      </div>
      <Progress 
        value={completionPercentage} 
        className="h-2"
      />
    </div>
  );
};

export default DisciplineProgressItem;
