import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PlanoHistoricoGroup from '@/components/plano/PlanoHistoricoGroup';
import PlanoHistoricoFilters from '@/components/plano/PlanoHistoricoFilters';

interface TopicoInfo {
  id: string;
  nome: string;
  disciplina: {
    id: string;
    nome: string;
  };
}

interface PlanoHistoricoItem {
  id: string;
  topico: TopicoInfo;
  prioridade: number;
  status: string;
  tipo: string;
  origem: string;
  created_at: string;
}

interface PlanoHistoricoData {
  origem: string;
  itens: PlanoHistoricoItem[];
}

type StatusFilter = 'all' | 'pendente' | 'concluido';

const PlanoHistorico = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: historicoData, isLoading } = useQuery<PlanoHistoricoData[]>({
    queryKey: ['plano-historico'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: planoItems, error } = await supabase
        .from('plano_estudo')
        .select(`
          id, 
          prioridade, 
          status, 
          tipo, 
          origem,
          created_at,
          topico:topico_id (
            id, 
            nome, 
            disciplina:disciplina_id (
              id, 
              nome
            )
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Group by origem
      const grupos: Record<string, PlanoHistoricoData> = {};
      
      planoItems?.forEach(item => {
        if (!item.topico?.disciplina) return;
        
        if (!grupos[item.origem]) {
          grupos[item.origem] = {
            origem: item.origem,
            itens: []
          };
        }
        
        grupos[item.origem].itens.push({
          id: item.id,
          topico: item.topico,
          prioridade: item.prioridade,
          status: item.status,
          tipo: item.tipo,
          origem: item.origem,
          created_at: item.created_at
        });
      });
      
      return Object.values(grupos);
    },
    enabled: !!user
  });

  const filteredData = historicoData?.map(grupo => ({
    ...grupo,
    itens: statusFilter === 'all' 
      ? grupo.itens 
      : grupo.itens.filter(item => item.status === statusFilter)
  })).filter(grupo => grupo.itens.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          userName={user?.user_metadata?.nome || "Estudante"} 
          onSignOut={signOut} 
        />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        userName={user?.user_metadata?.nome || "Estudante"} 
        onSignOut={signOut} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Histórico do Plano de Estudos</h1>
            <p className="text-gray-600 mt-2">Acompanhe a evolução dos seus planos de estudo ao longo do tempo</p>
          </div>
          <button
            onClick={() => navigate('/plano')}
            className="bg-[#5E60CE] text-white px-4 py-2 rounded-md hover:bg-[#5E60CE]/90 transition-colors"
          >
            Voltar ao Plano Atual
          </button>
        </div>

        <PlanoHistoricoFilters
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
        
        {filteredData && filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((grupo) => (
              <PlanoHistoricoGroup 
                key={grupo.origem} 
                grupo={grupo}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {statusFilter === 'all' 
                ? "Nenhum histórico encontrado"
                : `Nenhum item ${statusFilter === 'pendente' ? 'pendente' : 'concluído'} encontrado`
              }
            </h2>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "Realize o diagnóstico ou um simulado para começar a gerar seu histórico de estudos."
                : "Ajuste o filtro ou realize mais atividades para ver resultados."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/diagnostico')}
                className="bg-[#5E60CE] text-white px-6 py-3 rounded-md hover:bg-[#5E60CE]/90"
              >
                Fazer Diagnóstico
              </button>
              <button
                onClick={() => navigate('/simulado')}
                className="border border-[#5E60CE] text-[#5E60CE] px-6 py-3 rounded-md hover:bg-[#5E60CE]/10"
              >
                Fazer Simulado
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanoHistorico;
