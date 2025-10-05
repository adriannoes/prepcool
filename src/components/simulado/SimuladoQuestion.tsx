
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  enunciado: string;
  alternativa_correta: string;
  disciplina: string;
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
  const [simuladoInfo, setSimuladoInfo] = useState<{instituicao: string, ano: number} | null>(null);
  const [userResponses, setUserResponses] = useState<{[key: string]: string}>({});
  
  // Load questions and simulado info
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get simulado info
        const { data: simuladoData, error: simuladoError } = await supabase
          .from('simulado')
          .select('instituicao, ano')
          .eq('id', simuladoId)
          .single();
        
        if (simuladoError) throw simuladoError;
        
        if (simuladoData) {
          setSimuladoInfo(simuladoData);
        }
        
        // Get questions for this simulado
        const { data: questionsData, error: questionsError } = await supabase
          .from('pergunta')
          .select('*')
          .eq('simulado_id', simuladoId);
        
        if (questionsError) throw questionsError;
        
        if (questionsData) {
          setQuestions(questionsData);
        }
        
        // Get user's previous responses (if any)
        if (user) {
          const { data: responsesData, error: responsesError } = await supabase
            .from('resposta')
            .select('pergunta_id, alternativa_marcada')
            .eq('usuario_id', user.id)
            .in('pergunta_id', questionsData.map(q => q.id));
          
          if (responsesError) throw responsesError;
          
          if (responsesData && responsesData.length > 0) {
            const responseMap: {[key: string]: string} = {};
            responsesData.forEach(resp => {
              responseMap[resp.pergunta_id] = resp.alternativa_marcada;
            });
            
            setUserResponses(responseMap);
            
            // If user has already responded to the first question, select that option
            const firstQuestion = questionsData[0];
            if (firstQuestion && responseMap[firstQuestion.id]) {
              setSelectedOption(responseMap[firstQuestion.id]);
            }
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao carregar simulado',
          description: 'Ocorreu um erro ao carregar as perguntas. Por favor, tente novamente.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [simuladoId, user]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Update selected option when navigating questions if user has already responded
  useEffect(() => {
    if (currentQuestion && userResponses[currentQuestion.id]) {
      setSelectedOption(userResponses[currentQuestion.id]);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, currentQuestion, userResponses]);
  
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !user || !currentQuestion) return;
    
    setIsSaving(true);
    
    try {
      // Determine if the answer is correct
      const isCorrect = selectedOption === currentQuestion.alternativa_correta;
      
      // Update responses map
      setUserResponses(prev => ({
        ...prev,
        [currentQuestion.id]: selectedOption
      }));
      
      // Save answer to the resposta table
      const { error } = await supabase
        .from('resposta')
        .upsert({
          usuario_id: user.id,
          pergunta_id: currentQuestion.id,
          alternativa_marcada: selectedOption,
          acerto: isCorrect
        }, { onConflict: 'usuario_id, pergunta_id' });
      
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
  
  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
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
  
  if (questions.length === 0 || !simuladoInfo) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-orange-500" />
        <h2 className="text-2xl font-bold mt-4 mb-4">Simulado não encontrado</h2>
        <p className="text-gray-600 mb-6">Este simulado não possui questões ou não foi encontrado.</p>
        <Button onClick={() => navigate('/simulado')}>Voltar aos Simulados</Button>
      </div>
    );
  }
  
  return (
    <>
      <DashboardBreadcrumb 
        currentPage={`Questão ${currentQuestionIndex + 1}`}
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Simulados', path: '/simulado' }
        ]}
      />
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {simuladoInfo?.instituicao} {simuladoInfo?.ano}
          </h1>
          <Badge className="text-sm bg-[#5E60CE]">
            {currentQuestion?.disciplina}
          </Badge>
        </div>
        <p className="text-gray-600 mt-1">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Questão {currentQuestionIndex + 1}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="whitespace-pre-line">{currentQuestion.enunciado}</p>
          
          <div className="mt-8">
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
        <CardFooter className="flex flex-wrap md:flex-nowrap gap-3">
          {!isFirstQuestion && (
            <Button 
              variant="outline"
              onClick={handlePreviousQuestion}
              className="w-full md:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Questão anterior
            </Button>
          )}
          
          <Button 
            className="bg-[#5E60CE] hover:bg-[#5E60CE]/90 w-full md:w-auto ml-auto"
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
                Próxima questão
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
