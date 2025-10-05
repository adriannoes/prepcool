
import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface DisciplineProgressItemProps {
  name: string;
  topicsCompleted: number;
  totalTopics: number;
  completionPercentage: number;
  linkToDiscipline?: string;
}

const DisciplineProgressItem = ({
  name,
  topicsCompleted,
  totalTopics,
  completionPercentage,
  linkToDiscipline,
}: DisciplineProgressItemProps) => {
  const content = (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span>{topicsCompleted} de {totalTopics} tópicos</span>
      </div>
      <Progress 
        value={completionPercentage} 
        showPercentage={true}
        className="h-2"
      />
    </div>
  );

  return linkToDiscipline ? (
    <Link 
      to={linkToDiscipline} 
      className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-md transition-colors"
    >
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
};

export default DisciplineProgressItem;
