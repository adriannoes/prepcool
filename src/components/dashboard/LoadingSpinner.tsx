
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5E60CE] border-opacity-50"></div>
    </div>
  );
};

export default LoadingSpinner;
