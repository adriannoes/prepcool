import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import DisciplinaPlano from '@/components/plano/DisciplinaPlano';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Brain, BookOpen } from 'lucide-react';

interface TopicoInfo {
  id: string;
  nome: string;
  disciplina: {
    id: string;
    nome: string;
  };
}

interface PlanoItem {
  id: string;
  topico: TopicoInfo;
  prioridade: number;
  status: string;
  tipo: string;
  origem: string;
}

interface DisciplinaPlanoData {
  id: string;
  nome: string;
  itens: PlanoItem[];
}

const Plano = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: estudoPorDisciplina, isLoading } = useQuery<DisciplinaPlanoData[]>({
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
      const disciplinas: Record<string, DisciplinaPlanoData> = {};
      
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

  const DisciplinasSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="space-y-8">
        {[1, 2, 3].map(discipline => (
          <div key={discipline} className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map(item => (
                <div key={item} className="p-4 border border-gray-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <DashboardHeader 
        userName={user?.user_metadata?.nome || "Estudante"} 
        onSignOut={signOut} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardBreadcrumb 
          currentPage="Plano de Estudos"
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Plano de Estudos</h1>
            <p className="text-lg text-gray-600">Organize seus estudos com base em suas necessidades</p>
          </div>
          <button
            onClick={() => navigate('/plano/historico')}
            className="inline-flex items-center px-6 py-3 border border-[#5E60CE] text-[#5E60CE] bg-white rounded-xl hover:bg-[#5E60CE]/5 transition-all duration-200 font-medium"
          >
            Ver Histórico
          </button>
        </div>
        
        {isLoading ? (
          <DisciplinasSkeleton />
        ) : estudoPorDisciplina && estudoPorDisciplina.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="todos" className="text-base rounded-xl">Todos os Tópicos</TabsTrigger>
                <TabsTrigger value="pendentes" className="text-base rounded-xl">Pendentes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="todos" className="space-y-8">
                {estudoPorDisciplina.map((disciplina) => (
                  <DisciplinaPlano 
                    key={disciplina.id} 
                    disciplina={disciplina}
                    filtroStatus={null} // null means show all
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="pendentes" className="space-y-8">
                {estudoPorDisciplina.map((disciplina) => (
                  <DisciplinaPlano 
                    key={disciplina.id} 
                    disciplina={disciplina}
                    filtroStatus="pendente"
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <Brain className="mx-auto h-16 w-16 text-[#5E60CE] mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🧠 Você ainda não tem um plano de estudos!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Realize o diagnóstico ou um simulado para receber recomendações personalizadas
                de estudo baseadas no seu desempenho.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/diagnostico')}
                  className="px-8 py-4 bg-[#5E60CE] text-white rounded-xl hover:bg-[#5E60CE]/90 font-medium text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Brain className="h-5 w-5" />
                  Fazer Diagnóstico
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Plano;
