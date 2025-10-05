
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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrar por Status</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentFilter === filter.key
                ? 'bg-[#5E60CE] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
