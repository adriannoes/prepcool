
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center py-8">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-[#5E60CE] border-opacity-50`}></div>
    </div>
  );
};

export default LoadingSpinner;
