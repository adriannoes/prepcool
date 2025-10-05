
import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter = ({ current, max, className }: CharacterCounterProps) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 90;
  const isAtLimit = current >= max;

  return (
    <div className={cn("text-sm", className)}>
      <span className={cn(
        "font-medium",
        isAtLimit ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-gray-500"
      )}>
        {current} / {max}
      </span>
      {isNearLimit && (
        <span className="ml-2 text-xs">
          {isAtLimit ? "Limite atingido" : "Próximo do limite"}
        </span>
      )}
    </div>
  );
};
