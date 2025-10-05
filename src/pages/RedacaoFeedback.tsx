
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, ThumbsUp, Lightbulb, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackData {
  nota: number;
  tema: string;
  pontos_fortes: string[];
  melhorias: string[];
  comentario_final: string;
  redacao: string;
  created_at: string;
}

const RedacaoFeedback = () => {
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = () => {
      try {
        const storedFeedback = localStorage.getItem('essay_feedback');
        if (!storedFeedback) {
          setError('Nenhum feedback encontrado. Por favor, envie uma redação primeiro.');
          setIsLoading(false);
          return;
        }

        const feedbackData = JSON.parse(storedFeedback);
        
        // Validate required fields
        if (!feedbackData.nota || !feedbackData.tema) {
          setError('Dados de feedback incompletos.');
          setIsLoading(false);
          return;
        }

        setFeedbackData(feedbackData);
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError('Erro ao carregar o feedback.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 9) return 'Excelente';
    if (score >= 7) return 'Bom';
    if (score >= 5) return 'Regular';
    return 'Precisa melhorar';
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
            <p>Carregando feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <DashboardBreadcrumb 
          currentPage="Feedback"
          paths={[{ name: 'Redação', path: '/redacao' }]}
        />
        
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => navigate('/redacao')}
            className="bg-coral hover:bg-coral/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Redação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Feedback"
        paths={[{ name: 'Redação', path: '/redacao' }]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resultado da sua Redação</h1>
        <p className="text-gray-600 mt-2">
          Veja o feedback detalhado da correção automática.
        </p>
      </div>

      <div className="space-y-6">
        {/* Score Card */}
        <Card className="border-2 border-coral/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Award className="h-6 w-6 mr-2 text-coral" />
              Avaliação Final
            </CardTitle>
            <CardDescription>Tema: {feedbackData.tema}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center my-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(feedbackData.nota)}`}>
                  {feedbackData.nota}/10
                </div>
                <div className={`text-lg font-medium mt-2 ${getScoreColor(feedbackData.nota)}`}>
                  {getScoreDescription(feedbackData.nota)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Strengths */}
              <div>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                  Pontos Fortes
                </h3>
                <ul className="space-y-3">
                  {feedbackData.pontos_fortes?.map((ponto, index) => (
                    <li key={index} className="flex items-start">
                      <Badge className="mr-3 mt-0.5 bg-green-100 text-green-800 hover:bg-green-100">
                        ✓
                      </Badge>
                      <span className="leading-relaxed">{ponto}</span>
                    </li>
                  )) || (
                    <li className="text-gray-500 italic">Nenhum ponto forte específico mencionado.</li>
                  )}
                </ul>
              </div>
              
              {/* Improvement Suggestions */}
              <div>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                  Sugestões de Melhoria
                </h3>
                <ul className="space-y-3">
                  {feedbackData.melhorias?.map((sugestao, index) => (
                    <li key={index} className="flex items-start">
                      <Badge className="mr-3 mt-0.5 bg-amber-100 text-amber-800 hover:bg-amber-100">
                        →
                      </Badge>
                      <span className="leading-relaxed">{sugestao}</span>
                    </li>
                  )) || (
                    <li className="text-gray-500 italic">Nenhuma sugestão específica mencionada.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Comment */}
        {feedbackData.comentario_final && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-coral" />
                Comentário Final do Avaliador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedbackData.comentario_final}
                readOnly
                className="bg-gray-50 border-gray-200 min-h-[120px] text-base leading-relaxed resize-none"
              />
            </CardContent>
          </Card>
        )}

        {/* Essay Text */}
        <Card>
          <CardHeader>
            <CardTitle>Sua Redação</CardTitle>
            <CardDescription>
              Enviada em {new Date(feedbackData.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md border">
              <p className="whitespace-pre-wrap leading-relaxed">{feedbackData.redacao}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate('/redacao')}
              className="border-coral text-coral hover:bg-coral/10"
            >
              Escrever Nova Redação
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-coral hover:bg-coral/90"
            >
              Voltar ao Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RedacaoFeedback;
