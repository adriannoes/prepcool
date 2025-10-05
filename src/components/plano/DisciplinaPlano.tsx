
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Video, FileText, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlanoItem {
  id: string;
  topico: {
    id: string;
    nome: string;
    disciplina: {
      id: string;
      nome: string;
    };
  };
  prioridade: number;
  status: string;
  tipo: string;
  origem: string;
}

interface DisciplinaPlanoProps {
  disciplina: {
    id: string;
    nome: string;
    itens: PlanoItem[];
  };
  filtroStatus: string | null;
}

const DisciplinaPlano: React.FC<DisciplinaPlanoProps> = ({ disciplina, filtroStatus }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter items by status if filter is active
  const itensExibidos = filtroStatus 
    ? disciplina.itens.filter(item => item.status === filtroStatus)
    : disciplina.itens;
  
  // If no items to show after filtering, don't render the discipline section
  if (itensExibidos.length === 0) {
    return null;
  }

  const marcarComoConcluido = useMutation({
    mutationFn: async (planoId: string) => {
      const { error } = await supabase
        .from('plano_estudo')
        .update({ status: 'concluido' })
        .eq('id', planoId);
        
      if (error) throw error;
      return planoId;
    },
    onSuccess: () => {
      toast({
        title: "Exercício marcado como concluído!",
        description: "Seu progresso foi atualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ['plano-estudo'] });
      queryClient.invalidateQueries({ queryKey: ['study-plan-preview'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível marcar como concluído. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error updating plan item:', error);
    },
  });

  const navigateToItem = (item: PlanoItem) => {
    if (item.tipo === 'video') {
      navigate(`/aprendizado?topico=${item.topico.id}`);
    } else {
      navigate(`/simulado?disciplina=${item.topico.disciplina.id}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{disciplina.nome}</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {itensExibidos.map((item) => (
            <li 
              key={item.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                item.status === 'concluido' 
                  ? 'bg-coral/10 border-l-4 border-coral' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.tipo === 'video' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {item.tipo === 'video' ? (
                      <Video size={16} className="text-blue-600" />
                    ) : (
                      <FileText size={16} className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${
                      item.status === 'concluido' ? 'text-coral' : 'text-gray-900'
                    }`}>
                      {item.topico.nome}
                      {item.origem === 'diagnostico' && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                          Diagnóstico
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.tipo === 'video' ? 'Assistir vídeo-aula' : 'Fazer exercícios'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Only show completion control for exercise items */}
                  {item.tipo === 'exercicio' && (
                    <>
                      {item.status === 'pendente' ? (
                        <button 
                          onClick={() => marcarComoConcluido.mutate(item.id)}
                          disabled={marcarComoConcluido.isPending}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-coral border border-coral rounded-md hover:bg-coral hover:text-white transition-colors disabled:opacity-50"
                          title="Marcar como concluído"
                        >
                          <Check size={14} />
                          <span>Marcar como concluído</span>
                        </button>
                      ) : (
                        <span className="flex items-center space-x-1 text-xs font-medium text-coral bg-coral/10 border border-coral px-3 py-1.5 rounded-md">
                          <Check size={14} />
                          <span>Concluído</span>
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Show completion status for video items (non-interactive) */}
                  {item.tipo === 'video' && item.status === 'concluido' && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Concluído
                    </span>
                  )}
                  
                  <button 
                    onClick={() => navigateToItem(item)}
                    className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200"
                    title="Ir para o conteúdo"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DisciplinaPlano;
