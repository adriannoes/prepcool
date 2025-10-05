
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define types for our progress data
export interface DisciplineProgress {
  discipline_name: string;
  topics_completed: number;
  total_topics: number;
  completion_percentage: number;
}

export interface SimuladoProgress {
  completed: number;
  total: number;
}

export interface RedacaoProgress {
  submitted: number;
  average_score: number | null;
}

export const useDashboardData = (user: User | null) => {
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

  return {
    loading,
    disciplineProgress,
    simuladoProgress,
    redacaoProgress
  };
};
