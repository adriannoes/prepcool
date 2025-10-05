
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import DisciplinaPlano from '@/components/plano/DisciplinaPlano';

const Plano = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: estudoPorDisciplina, isLoading } = useQuery({
    queryKey: ['plano-estudo'],
    queryFn: async () => {
      if (!user) return [];
      
      // First, fetch all plan items with their topics and related discipline info
      const { data: planoItems, error } = await supabase
        .from('plano_estudo')
        .select(`
          id, 
          prioridade, 
          status, 
          tipo, 
          origem,
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
        .order('prioridade', { ascending: true });
        
      if (error) throw error;
      
      // Group by discipline
      const disciplinas = {};
      
      planoItems?.forEach(item => {
        if (!item.topico?.disciplina) return;
        
        const disciplinaId = item.topico.disciplina.id;
        const disciplinaNome = item.topico.disciplina.nome;
        
        if (!disciplinas[disciplinaId]) {
          disciplinas[disciplinaId] = {
            id: disciplinaId,
            nome: disciplinaNome,
            itens: []
          };
        }
        
        disciplinas[disciplinaId].itens.push({
          id: item.id,
          topico: item.topico,
          prioridade: item.prioridade,
          status: item.status,
          tipo: item.tipo,
          origem: item.origem
        });
      });
      
      return Object.values(disciplinas);
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          userName={user?.user_metadata?.nome || "Estudante"} 
          onSignOut={signOut} 
        />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600">Carregando seu plano de estudos...</span>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Plano de Estudos</h1>
        
        {estudoPorDisciplina?.length ? (
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="todos">Todos os Tópicos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="space-y-8">
              {estudoPorDisciplina.map(disciplina => (
                <DisciplinaPlano 
                  key={disciplina.id} 
                  disciplina={disciplina}
                  filtroStatus={null} // null means show all
                />
              ))}
            </TabsContent>
            
            <TabsContent value="pendentes" className="space-y-8">
              {estudoPorDisciplina.map(disciplina => (
                <DisciplinaPlano 
                  key={disciplina.id} 
                  disciplina={disciplina}
                  filtroStatus="pendente"
                />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Nenhum plano de estudos encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Realize o diagnóstico ou um simulado para receber recomendações personalizadas
              de estudo baseadas no seu desempenho.
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

export default Plano;
