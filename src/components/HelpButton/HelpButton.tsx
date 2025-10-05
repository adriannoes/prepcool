
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import HelpDialog from './HelpDialog';

const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="relative h-12 w-12 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-[#5E60CE] hover:shadow-sm group"
          >
            <HelpCircle className="h-5 w-5 text-[#5E60CE] group-hover:text-coral transition-colors duration-200" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Precisa de ajuda?</p>
        </TooltipContent>
      </Tooltip>
      <HelpDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </TooltipProvider>
  );
};

export default HelpButton;
