
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PlanoHistoricoFiltersProps {
  currentFilter: 'all' | 'pendente' | 'concluido';
  onFilterChange: (filter: 'all' | 'pendente' | 'concluido') => void;
}

const PlanoHistoricoFilters = ({ currentFilter, onFilterChange }: PlanoHistoricoFiltersProps) => {
  const filters = [
    { key: 'all' as const, label: 'Todos', count: null },
    { key: 'pendente' as const, label: 'Pendentes', count: null },
    { key: 'concluido' as const, label: 'Concluídos', count: null }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Filtrar por Status</h3>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
              currentFilter === filter.key
                ? 'bg-[#5E60CE] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlanoHistoricoFilters;
