
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
        // Fetch simulados with question counts
        const { data, error } = await supabase
          .from('simulado')
          .select('id, instituicao, ano');

        if (error) throw error;

        if (data && data.length > 0) {
          // Get question counts for each simulado
          const simuladoIds = data.map(s => s.id);

          const { data: questionCounts, error: countError } = await supabase
            .from('pergunta')
            .select('simulado_id, count(*)')
            .in('simulado_id', simuladoIds)
            .group('simulado_id');
          
          if (countError) throw countError;

          // Add question count to each simulado
          const simuladosWithCount = data.map(simulado => {
            const countObj = questionCounts?.find(qc => qc.simulado_id === simulado.id);
            return {
              ...simulado,
              question_count: countObj ? Number(countObj.count) : 0
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#5E60CE]" />
        <p className="mt-4 text-gray-600">Carregando simulados...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Simulados"
        paths={[{ name: 'Dashboard', path: '/dashboard' }]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Simulados Disponíveis</h1>
        <p className="text-gray-600 mt-2">
          Escolha um simulado para praticar e avaliar seu conhecimento.
        </p>
      </div>

      {Object.keys(simulados).length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <School className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum simulado disponível</h3>
          <p className="mt-2 text-gray-500">
            No momento não há simulados disponíveis. Confira novamente mais tarde.
          </p>
        </div>
      ) : (
        Object.keys(simulados).map(instituicao => (
          <div key={instituicao} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{instituicao}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulados[instituicao].map(simulado => (
                <Card key={simulado.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{simulado.instituicao} {simulado.ano}</CardTitle>
                      <Badge className="bg-[#5E60CE]">{simulado.question_count} questões</Badge>
                    </div>
                    <CardDescription>
                      Simulado preparatório para o vestibular {simulado.ano}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Este simulado contém questões baseadas no vestibular
                      da {simulado.instituicao} do ano de {simulado.ano}.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleStartSimulado(simulado.id)} 
                      disabled={startingSimuladoId === simulado.id}
                      className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90"
                    >
                      {startingSimuladoId === simulado.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
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
  );
};

export default SimuladosList;
