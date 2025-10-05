
import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';

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
    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
        {linkToDiscipline && (
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#5E60CE] transition-colors" />
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{topicsCompleted} de {totalTopics} tópicos</span>
          <span className="font-medium">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-2 bg-gray-200"
        />
      </div>
    </div>
  );

  return linkToDiscipline ? (
    <Link to={linkToDiscipline} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
};

export default DisciplineProgressItem;
