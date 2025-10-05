
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{disciplina.nome}</h2>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {itensExibidos.map((item) => (
            <li 
              key={item.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                item.status === 'concluido' 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    item.tipo === 'video' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {item.tipo === 'video' ? (
                      <Video size={20} className="text-blue-600" />
                    ) : (
                      <FileText size={20} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-semibold ${
                      item.status === 'concluido' ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {item.topico.nome}
                      {item.origem === 'diagnostico' && (
                        <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-[#5E60CE] text-white">
                          Diagnóstico
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.tipo === 'video' ? 'Assistir vídeo-aula' : 'Fazer exercícios'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Only show completion control for exercise items */}
                  {item.tipo === 'exercicio' && (
                    <>
                      {item.status === 'pendente' ? (
                        <button 
                          onClick={() => marcarComoConcluido.mutate(item.id)}
                          disabled={marcarComoConcluido.isPending}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-[#5E60CE] border border-[#5E60CE] rounded-xl hover:bg-[#5E60CE] hover:text-white transition-all duration-200 disabled:opacity-50"
                          title="Marcar como concluído"
                        >
                          <Check size={16} />
                          <span>Marcar como concluído</span>
                        </button>
                      ) : (
                        <span className="flex items-center space-x-2 text-sm font-semibold text-green-800 bg-green-100 px-4 py-2 rounded-xl">
                          <Check size={16} />
                          <span>Concluído</span>
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Show completion status for video items (non-interactive) */}
                  {item.tipo === 'video' && item.status === 'concluido' && (
                    <span className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                      Concluído
                    </span>
                  )}
                  
                  <button 
                    onClick={() => navigateToItem(item)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 hover:text-[#5E60CE] transition-colors"
                    title="Ir para o conteúdo"
                  >
                    <ChevronRight size={20} />
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
