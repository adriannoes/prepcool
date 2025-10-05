
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

interface Simulado {
  id: string;
  instituicao: string;
  ano: number;
  created_at: string;
  pergunta_count?: number;
  completed?: boolean;
}

const SimuladosList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimulados = async () => {
      if (!user) return;
      
      try {
        // Get all simulados with question count
        const { data: simuladosData, error: simuladosError } = await supabase
          .from('simulado')
          .select(`
            *,
            pergunta (count)
          `)
          .order('ano', { ascending: false });

        if (simuladosError) throw simuladosError;

        // Get user's completed simulados
        const { data: completedData, error: completedError } = await supabase
          .from('resposta')
          .select('pergunta_id, pergunta!inner(simulado_id)')
          .eq('usuario_id', user.id);

        if (completedError) throw completedError;

        // Process data to add completion status and question count
        const processedSimulados = simuladosData?.map(simulado => {
          const questionCount = simulado.pergunta?.[0]?.count || 0;
          const userResponses = completedData?.filter(
            resp => resp.pergunta?.simulado_id === simulado.id
          ).length || 0;
          
          return {
            ...simulado,
            pergunta_count: questionCount,
            completed: questionCount > 0 && userResponses >= questionCount
          };
        }) || [];

        setSimulados(processedSimulados);
      } catch (error) {
        console.error('Error fetching simulados:', error);
        toast({
          title: 'Erro ao carregar simulados',
          description: 'Não foi possível carregar a lista de simulados.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimulados();
  }, [user]);

  const handleStartSimulado = (simuladoId: string) => {
    navigate(`/simulado/${simuladoId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardBreadcrumb currentPage="Simulados" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulados</h1>
          <p className="text-gray-600 text-lg">
            Teste seus conhecimentos com simulados de vestibulares anteriores
          </p>
        </div>

        {simulados.length === 0 ? (
          <EmptyState 
            message="Nenhum simulado disponível no momento. Novos simulados serão adicionados em breve!"
            icon={<BookOpen className="h-12 w-12" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulados.map((simulado) => (
              <Card key={simulado.id} className="bg-white rounded-2xl shadow-md border-0 hover:shadow-lg transition-shadow">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {simulado.instituicao}
                    </CardTitle>
                    {simulado.completed && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Concluído
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{simulado.ano}</span>
                    </div>
                    
                    {simulado.pergunta_count && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{simulado.pergunta_count} questões</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>~{Math.ceil((simulado.pergunta_count || 0) * 2)} min</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  <Button 
                    onClick={() => handleStartSimulado(simulado.id)}
                    className="w-full bg-coral hover:bg-coral/90 text-white rounded-xl px-6 py-3 h-auto font-semibold"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {simulado.completed ? 'Refazer Simulado' : 'Iniciar Simulado'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimuladosList;
