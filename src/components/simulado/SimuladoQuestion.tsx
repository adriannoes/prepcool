
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';

interface Question {
  id: string;
  enunciado: string;
  alternativa_correta: string;
}

interface SimuladoQuestionProps {
  simuladoId: string;
}

const alternativas = ['A', 'B', 'C', 'D', 'E'];

const SimuladoQuestion = ({ simuladoId }: SimuladoQuestionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load questions for this simulado
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('pergunta')
          .select('*')
          .eq('simulado_id', simuladoId);
        
        if (error) throw error;
        
        if (data) {
          setQuestions(data);
        }
        
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Erro ao carregar simulado',
          description: 'Ocorreu um erro ao carregar as perguntas. Por favor, tente novamente.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [simuladoId]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !user) return;
    
    setIsSaving(true);
    
    try {
      // Determine if the answer is correct
      const isCorrect = selectedOption === currentQuestion.alternativa_correta;
      
      // Save answer to the resposta table
      const { error } = await supabase
        .from('resposta')
        .insert({
          usuario_id: user.id,
          pergunta_id: currentQuestion.id,
          alternativa_marcada: selectedOption,
          acerto: isCorrect
        });
      
      if (error) throw error;
      
      // If this is the last question, finalize the simulado
      if (isLastQuestion) {
        // Trigger webhook
        await fetch('/webhook/simuladoDone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            simulado_id: simuladoId,
            usuario_id: user.id
          }),
        });
        
        // Show completion message
        toast({
          title: 'Simulado finalizado!',
          description: 'Suas respostas foram salvas. Estamos gerando seu plano de estudos personalizado.',
        });
        
        // Redirect to plano
        navigate('/plano');
        
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      }
      
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: 'Erro ao salvar resposta',
        description: 'Ocorreu um erro ao salvar sua resposta. Por favor, tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#5E60CE]" />
        <p className="mt-4 text-gray-600">Carregando simulado...</p>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Simulado não encontrado</h2>
        <p className="text-gray-600 mb-6">Este simulado não possui questões ou não foi encontrado.</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }
  
  return (
    <>
      <DashboardBreadcrumb 
        currentPage={`Questão ${currentQuestionIndex + 1}`}
        paths={[{ name: 'Simulado', path: '/simulado' }]}
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Simulado em andamento</h1>
        <p className="text-gray-600">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Questão {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>{currentQuestion.enunciado}</p>
          
          <div className="mt-6">
            <RadioGroup 
              value={selectedOption || ''}
              onValueChange={setSelectedOption}
              className="space-y-4"
            >
              {alternativas.map(option => (
                <div key={option} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option} id={`option-${option}`} />
                  <label 
                    htmlFor={`option-${option}`}
                    className="text-base font-medium flex-grow cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="bg-[#5E60CE] hover:bg-[#5E60CE]/90 w-full md:w-auto"
            onClick={handleSubmitAnswer}
            disabled={!selectedOption || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isLastQuestion ? (
              <>
                Finalizar simulado
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Próxima pergunta
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-[#5E60CE] h-2.5 rounded-full" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right mt-1">
        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% concluído
      </p>
    </>
  );
};

export default SimuladoQuestion;
