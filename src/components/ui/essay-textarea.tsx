
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { CharacterCounter } from '@/components/ui/character-counter';
import { cn } from '@/lib/utils';

interface EssayTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MAX_CHARACTERS = 3000;
const MAX_LINES = 30;

export const EssayTextarea = ({ 
  value, 
  onChange, 
  placeholder = "Comece a escrever sua redação aqui...",
  className,
  disabled
}: EssayTextareaProps) => {
  const [lineCount, setLineCount] = useState(1);

  // Count lines in the text
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newLines = newValue.split('\n').length;
    
    // Prevent input if exceeding character limit
    if (newValue.length > MAX_CHARACTERS) {
      return;
    }
    
    // Prevent input if exceeding line limit
    if (newLines > MAX_LINES) {
      return;
    }
    
    onChange(newValue);
  };

  const isNearCharLimit = value.length >= MAX_CHARACTERS * 0.9;
  const isNearLineLimit = lineCount >= MAX_LINES * 0.9;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "min-h-[400px] text-base leading-relaxed resize-none",
          isNearCharLimit && "border-yellow-400",
          value.length >= MAX_CHARACTERS && "border-red-400",
          className
        )}
        disabled={disabled}
        maxLength={MAX_CHARACTERS}
      />
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <CharacterCounter 
            current={value.length} 
            max={MAX_CHARACTERS}
          />
          <div className={cn(
            "font-medium",
            lineCount >= MAX_LINES ? "text-red-600" : 
            isNearLineLimit ? "text-yellow-600" : "text-gray-500"
          )}>
            {lineCount} / {MAX_LINES} linhas
          </div>
        </div>
        
        {(isNearCharLimit || isNearLineLimit) && (
          <div className="text-xs text-yellow-600">
            Próximo do limite ENEM
          </div>
        )}
      </div>
    </div>
  );
};
