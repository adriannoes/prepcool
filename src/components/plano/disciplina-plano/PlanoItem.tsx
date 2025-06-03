import React from 'react';
import { Check, Video, FileText, ChevronRight } from 'lucide-react';
import type { PlanoItemProps } from './types';

const PlanoItem: React.FC<PlanoItemProps> = ({ 
  item, 
  onMarcarConcluido, 
  onNavigateToItem, 
  isUpdating 
}) => {
  const isCompleted = item.status === 'concluido';
  const isVideo = item.tipo === 'video';
  const isExercise = item.tipo === 'exercicio';
  const isDiagnostico = item.origem === 'diagnostico';

  const getIconProps = () => {
    if (isVideo) {
      return {
        icon: Video,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };
    }
    return {
      icon: FileText,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    };
  };

  const { icon: Icon, bgColor, iconColor } = getIconProps();

  const getActionDescription = () => {
    return isVideo ? 'Assistir vídeo-aula' : 'Fazer exercícios';
  };

  const renderCompletionControl = () => {
    if (!isExercise) {
      // For video items, only show completion status if completed
      if (isCompleted) {
        return (
          <span className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full">
            Concluído
          </span>
        );
      }
      return null;
    }

    // For exercise items, show interactive completion controls
    if (item.status === 'pendente') {
      return (
        <button 
          onClick={() => onMarcarConcluido(item.id)}
          disabled={isUpdating}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-[#5E60CE] border border-[#5E60CE] rounded-xl hover:bg-[#5E60CE] hover:text-white transition-all duration-200 disabled:opacity-50"
          title="Marcar como concluído"
        >
          <Check size={16} />
          <span>Marcar como concluído</span>
        </button>
      );
    }

    return (
      <span className="flex items-center space-x-2 text-sm font-semibold text-green-800 bg-green-100 px-4 py-2 rounded-xl">
        <Check size={16} />
        <span>Concluído</span>
      </span>
    );
  };

  return (
    <li 
      className={`p-6 hover:bg-gray-50 transition-colors ${
        isCompleted ? 'bg-green-50 border-l-4 border-green-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon size={20} className={iconColor} />
          </div>
          <div className="flex-1">
            <h3 className={`text-base font-semibold ${
              isCompleted ? 'text-green-700' : 'text-gray-900'
            }`}>
              {item.topico.nome}
              {isDiagnostico && (
                <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-[#5E60CE] text-white">
                  Diagnóstico
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getActionDescription()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {renderCompletionControl()}
          
          <button 
            onClick={() => onNavigateToItem(item)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 hover:text-[#5E60CE] transition-colors"
            title="Ir para o conteúdo"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </li>
  );
};

export default PlanoItem; 