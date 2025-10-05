
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ 
  message, 
  icon = <AlertCircle className="h-5 w-5" />, 
  className 
}: EmptyStateProps) => {
  return (
    <Alert variant="default" className={`bg-[#F6F6F7] border-dashed border-gray-200 ${className}`}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="text-gray-400 mb-2">
          {icon}
        </div>
        <AlertDescription className="text-gray-600">
          {message}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default EmptyState;
