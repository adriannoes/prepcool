import React from 'react';
import type { DisciplinaPlanoHeaderProps } from './types';

const DisciplinaPlanoHeader: React.FC<DisciplinaPlanoHeaderProps> = ({ nome }) => {
  return (
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      {nome}
    </h2>
  );
};

export default DisciplinaPlanoHeader; 