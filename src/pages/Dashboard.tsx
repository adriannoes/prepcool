import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, FileText, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Define types for our progress data
interface DisciplineProgress {
  discipline_name: string;
  topics_completed: number;
  total_topics: number;
  completion_percentage: number;
}

interface SimuladoProgress {
  completed: number;
  total: number;
}

interface RedacaoProgress {
  submitted: number;
  average_score: number | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [disciplineProgress, setDisciplineProgress] = useState<DisciplineProgress[]>([]);
  const [simuladoProgress, setSimuladoProgress] = useState<SimuladoProgress>({ completed: 0, total: 0 });
  const [redacaoProgress, setRedacaoProgress] = useState<RedacaoProgress>({ submitted: 0, average_score: null });

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch discipline progress
        const { data: disciplineData, error: disciplineError } = await supabase
          .rpc('get_discipline_progress', { user_id: user.id })
          .select('*');
        
        // If the RPC function doesn't exist, we'll use a workaround with multiple queries
        if (disciplineError) {
          console.log('Using fallback method for discipline progress');
          
          // Get all disciplines
          const { data: disciplines } = await supabase
            .from('disciplina')
            .select('id, nome');
          
          if (disciplines) {
            const progressData: DisciplineProgress[] = [];
            
            // For each discipline, get topics and completed videos
            for (const discipline of disciplines) {
              // Get topics for this discipline
              const { data: topics } = await supabase
                .from('topico')
                .select('id')
                .eq('disciplina_id', discipline.id);
              
              const totalTopics = topics?.length || 0;
              
              // Get completed topics (where the user has watched at least one video)
              const { data: completedTopicsData } = await supabase
                .from('video_assistido')
                .select('video(topico_id)')
                .eq('usuario_id', user.id);
              
              // Get unique topic IDs from watched videos
              const completedTopicIds = new Set();
              completedTopicsData?.forEach(item => {
                if (item.video?.topico_id) {
                  completedTopicIds.add(item.video.topico_id);
                }
              });
              
              const topicsCompleted = completedTopicIds.size;
              const percentage = totalTopics > 0 ? (topicsCompleted / totalTopics) * 100 : 0;
              
              progressData.push({
                discipline_name: discipline.nome,
                topics_completed: topicsCompleted,
                total_topics: totalTopics,
                completion_percentage: percentage
              });
            }
            
            setDisciplineProgress(progressData);
          }
        } else if (disciplineData) {
          setDisciplineProgress(disciplineData);
        }
        
        // Fetch simulado progress
        const { data: simulados } = await supabase
          .from('simulado')
          .select('count');
        
        const totalSimulados = simulados ? parseInt(simulados[0]?.count || '0') : 0;
        
        const { data: completedSimulados } = await supabase
          .from('resposta')
          .select('pergunta(simulado_id)')
          .eq('usuario_id', user.id);
        
        // Get unique simulado IDs from completed questions
        const completedSimuladoIds = new Set();
        completedSimulados?.forEach(item => {
          if (item.pergunta?.simulado_id) {
            completedSimuladoIds.add(item.pergunta.simulado_id);
          }
        });
        
        setSimuladoProgress({
          completed: completedSimuladoIds.size,
          total: totalSimulados
        });
        
        // Fetch redação progress
        const { data: redacoes, error: redacaoError } = await supabase
          .from('redacao')
          .select('id, nota')
          .eq('usuario_id', user.id);
        
        if (!redacaoError && redacoes) {
          const submitted = redacoes.length;
          const totalScore = redacoes.reduce((sum, redacao) => {
            return sum + (redacao.nota || 0);
          }, 0);
          
          const averageScore = submitted > 0 ? totalScore / submitted : null;
          
          setRedacaoProgress({
            submitted,
            average_score: averageScore
          });
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-off-white p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <div className="flex flex-wrap justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">
                Olá, {user?.user_metadata?.nome || 'Estudante'}! Acompanhe seu progresso de estudos.
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              className="border-coral text-coral hover:bg-coral/10 mt-2 md:mt-0"
            >
              Sair
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5E60CE] border-opacity-50"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trilha de Aprendizado */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Trilha de Aprendizado</CardTitle>
                    <CardDescription>Seu progresso por disciplina</CardDescription>
                  </div>
                  <BookOpen className="h-6 w-6 text-[#5E60CE]" />
                </CardHeader>
                <CardContent>
                  {disciplineProgress.length > 0 ? (
                    <div className="space-y-4">
                      {disciplineProgress.map((discipline, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{discipline.discipline_name}</span>
                            <span>{discipline.topics_completed} de {discipline.total_topics} tópicos</span>
                          </div>
                          {/* FIX: Ensuring the progress value is a number */}
                          <Progress value={discipline.completion_percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Nenhuma disciplina encontrada ou progresso disponível.
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to="/aprendizado" className="w-full">
                    <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Acessar Trilha de Aprendizado
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Simulados */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Simulados</CardTitle>
                    <CardDescription>Suas provas e exercícios</CardDescription>
                  </div>
                  <Award className="h-6 w-6 text-[#5E60CE]" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <div className="text-4xl font-bold text-[#5E60CE]">{simuladoProgress.completed}</div>
                    <div className="text-gray-500">de {simuladoProgress.total} simulados completados</div>
                    
                    {simuladoProgress.total > 0 && (
                      <Progress 
                        // FIX: Ensuring the progress value is a number
                        value={(simuladoProgress.completed / simuladoProgress.total) * 100} 
                        className="w-full mt-4 h-2" 
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
                    <Award className="mr-2 h-4 w-4" />
                    Praticar Simulados
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Redações */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Redações</CardTitle>
                    <CardDescription>Seus textos e avaliações</CardDescription>
                  </div>
                  <FileText className="h-6 w-6 text-[#5E60CE]" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <div className="text-4xl font-bold text-[#5E60CE]">{redacaoProgress.submitted}</div>
                    <div className="text-gray-500">redações enviadas</div>
                    
                    {redacaoProgress.average_score !== null && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="text-md px-3 py-1">
                          {/* FIX: Convert average_score to string for Badge */}
                          Nota média: {redacaoProgress.average_score !== null ? Math.round(redacaoProgress.average_score).toString() : "0"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Escrever Redação
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Plano de Estudos */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Plano de Estudos</CardTitle>
                    <CardDescription>Recomendações personalizadas</CardDescription>
                  </div>
                  <TrendingUp className="h-6 w-6 text-[#5E60CE]" />
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">
                      Estamos analisando seu desempenho para criar um plano personalizado.
                    </p>
                    <Badge>Em breve</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ver Plano de Estudos
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
