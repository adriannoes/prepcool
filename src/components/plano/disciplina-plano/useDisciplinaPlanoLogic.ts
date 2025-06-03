import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  UseDisciplinaPlanoLogicProps, 
  UseDisciplinaPlanoLogicReturn,
  PlanoItem 
} from './types';

export const useDisciplinaPlanoLogic = ({
  disciplina,
  filtroStatus
}: UseDisciplinaPlanoLogicProps): UseDisciplinaPlanoLogicReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter items by status if filter is active
  const itensExibidos = filtroStatus 
    ? disciplina.itens.filter(item => item.status === filtroStatus)
    : disciplina.itens;

  // Determine if component should render
  const shouldRender = itensExibidos.length > 0;

  // Mutation for marking items as completed
  const marcarComoConcluidoMutation = useMutation({
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

  // Navigation logic
  const navigateToItem = (item: PlanoItem): void => {
    if (item.tipo === 'video') {
      navigate(`/aprendizado?topico=${item.topico.id}`);
    } else {
      navigate(`/simulado?disciplina=${item.topico.disciplina.id}`);
    }
  };

  // Handler for marking items as completed
  const marcarComoConcluido = (itemId: string): void => {
    marcarComoConcluidoMutation.mutate(itemId);
  };

  return {
    itensExibidos,
    marcarComoConcluido,
    navigateToItem,
    isUpdating: marcarComoConcluidoMutation.isPending,
    shouldRender
  };
}; 