import React from 'react';
import DisciplinaPlanoHeader from './DisciplinaPlanoHeader';
import PlanoItem from './PlanoItem';
import { useDisciplinaPlanoLogic } from './useDisciplinaPlanoLogic';
import type { DisciplinaPlanoProps } from './types';

const DisciplinaPlano: React.FC<DisciplinaPlanoProps> = ({ disciplina, filtroStatus }) => {
  const {
    itensExibidos,
    marcarComoConcluido,
    navigateToItem,
    isUpdating,
    shouldRender
  } = useDisciplinaPlanoLogic({ disciplina, filtroStatus });

  // If no items to show after filtering, don't render the discipline section
  if (!shouldRender) {
    return null;
  }

  return (
    <div>
      <DisciplinaPlanoHeader nome={disciplina.nome} />
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {itensExibidos.map((item) => (
            <PlanoItem
              key={item.id}
              item={item}
              onMarcarConcluido={marcarComoConcluido}
              onNavigateToItem={navigateToItem}
              isUpdating={isUpdating}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DisciplinaPlano; 