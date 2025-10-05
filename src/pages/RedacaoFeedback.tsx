
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Award, ThumbsUp, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Redacao {
  id: string;
  tema: string;
  texto: string;
  feedback: string | null;
  nota: number | null;
  created_at: string;
}

const RedacaoFeedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redacaoId = searchParams.get('id');
  
  const [redacao, setRedacao] = useState<Redacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedacao = async () => {
      if (!redacaoId || !user) {
        setError('Redação não encontrada ou usuário não autenticado');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('redacao')
          .select('*')
          .eq('id', redacaoId)
          .eq('usuario_id', user.id)
          .single();

        if (error) throw error;
        if (!data) {
          setError('Redação não encontrada');
        } else {
          setRedacao(data);
        }
      } catch (err) {
        console.error('Error fetching essay:', err);
        setError('Erro ao carregar a redação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedacao();
  }, [redacaoId, user]);

  // Format feedback with sections
  const formatFeedback = (feedback: string | null): { pontos: string[]; sugestoes: string[] } => {
    if (!feedback) return { pontos: [], sugestoes: [] };
    
    // In a real implementation, this would parse structured feedback
    // For now, we'll just create some mock sections
    return {
      pontos: [
        'Argumentação bem desenvolvida',
        'Bom uso de exemplos',
        'Introdução clara e objetiva'
      ],
      sugestoes: [
        'Melhorar a conexão entre parágrafos',
        'Desenvolver melhor a conclusão',
        'Revisar erros gramaticais'
      ]
    };
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-gray-500';
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formattedFeedback = redacao ? formatFeedback(redacao.feedback) : { pontos: [], sugestoes: [] };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Feedback da Redação"
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Redação', path: '/redacao' }
        ]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resultado da sua Redação</h1>
        <p className="text-gray-600 mt-2">
          Veja o feedback e pontuação da sua redação.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-[#5E60CE]" />
          <p className="mt-4 text-gray-600">Carregando feedback...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => navigate('/redacao')}
            className="mt-4 bg-[#5E60CE] hover:bg-[#5E60CE]/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Redação
          </Button>
        </div>
      ) : redacao ? (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="border-2 border-[#5E60CE]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Avaliação</CardTitle>
              <CardDescription>Tema: {redacao.tema}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center my-4">
                <div className={`text-5xl font-bold ${getScoreColor(redacao.nota)}`}>
                  {redacao.nota !== null ? redacao.nota : '-'}/10
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Strengths */}
                <div>
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                    Pontos Fortes
                  </h3>
                  <ul className="space-y-2">
                    {formattedFeedback.pontos.map((ponto, index) => (
                      <li key={index} className="flex items-start">
                        <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">✓</Badge>
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Improvement Suggestions */}
                <div>
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                    Sugestões de Melhoria
                  </h3>
                  <ul className="space-y-2">
                    {formattedFeedback.sugestoes.map((sugestao, index) => (
                      <li key={index} className="flex items-start">
                        <Badge className="mr-2 bg-amber-100 text-amber-800 hover:bg-amber-100">→</Badge>
                        <span>{sugestao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Dashboard
              </Button>
            </CardFooter>
          </Card>

          {/* Essay Text */}
          <Card>
            <CardHeader>
              <CardTitle>Sua Redação</CardTitle>
              <CardDescription>
                Enviada em {new Date(redacao.created_at).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="whitespace-pre-wrap">{redacao.texto}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default RedacaoFeedback;
