
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Badge } from '@/components/ui/badge';

interface Simulado {
  id: string;
  instituicao: string;
  ano: number;
  question_count?: number;
}

interface GroupedSimulados {
  [instituicao: string]: Simulado[];
}

const SimuladosList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState<GroupedSimulados>({});
  const [isLoading, setIsLoading] = useState(true);
  const [startingSimuladoId, setStartingSimuladoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimulados = async () => {
      try {
        // Fetch simulados
        const { data: simuladosData, error } = await supabase
          .from('simulado')
          .select('id, instituicao, ano');

        if (error) throw error;

        if (simuladosData && simuladosData.length > 0) {
          // Get question counts for each simulado
          const simuladoIds = simuladosData.map(s => s.id);

          // Changed approach: aggregate counts client-side instead of using group()
          const { data: questionCountData, error: countError } = await supabase
            .from('pergunta')
            .select('simulado_id')
            .in('simulado_id', simuladoIds);
          
          if (countError) throw countError;

          // Create a map of simulado_id -> count
          const countMap: Record<string, number> = {};
          if (questionCountData) {
            questionCountData.forEach(item => {
              if (countMap[item.simulado_id]) {
                countMap[item.simulado_id]++;
              } else {
                countMap[item.simulado_id] = 1;
              }
            });
          }
          
          // Add question count to each simulado
          const simuladosWithCount = simuladosData.map(simulado => {
            return {
              ...simulado,
              question_count: countMap[simulado.id] || 0
            };
          });

          // Group simulados by instituicao
          const grouped: GroupedSimulados = {};
          simuladosWithCount.forEach(simulado => {
            if (!grouped[simulado.instituicao]) {
              grouped[simulado.instituicao] = [];
            }
            grouped[simulado.instituicao].push(simulado);
          });

          // Sort each group by year (descending)
          Object.keys(grouped).forEach(instituicao => {
            grouped[instituicao].sort((a, b) => b.ano - a.ano);
          });

          setSimulados(grouped);
        }
      } catch (error) {
        console.error('Error fetching simulados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os simulados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimulados();
  }, []);

  const handleStartSimulado = (id: string) => {
    setStartingSimuladoId(id);
    navigate(`/simulado/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[#5E60CE]" />
            <p className="mt-4 text-lg text-gray-600">Carregando simulados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardBreadcrumb 
          currentPage="Simulados"
          paths={[{ name: 'Dashboard', path: '/dashboard' }]}
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simulados Disponíveis</h1>
          <p className="text-lg text-gray-600">
            Escolha um simulado para praticar e avaliar seu conhecimento.
          </p>
        </div>

        {Object.keys(simulados).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <School className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nenhum simulado disponível</h3>
            <p className="text-lg text-gray-600">
              No momento não há simulados disponíveis. Confira novamente mais tarde.
            </p>
          </div>
        ) : (
          Object.keys(simulados).map(instituicao => (
            <div key={instituicao} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{instituicao}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {simulados[instituicao].map(simulado => (
                  <Card key={simulado.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md rounded-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold text-gray-900">{simulado.instituicao} {simulado.ano}</CardTitle>
                        <Badge className="bg-[#5E60CE] hover:bg-[#5E60CE] text-white rounded-xl">
                          {simulado.question_count} questões
                        </Badge>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Simulado preparatório para o vestibular {simulado.ano}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Este simulado contém questões baseadas no vestibular
                        da {simulado.instituicao} do ano de {simulado.ano}.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleStartSimulado(simulado.id)} 
                        disabled={startingSimuladoId === simulado.id}
                        className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white rounded-xl font-medium text-base transition-all duration-200"
                      >
                        {startingSimuladoId === simulado.id ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 h-5 w-5" />
                            Iniciar Simulado
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimuladosList;
