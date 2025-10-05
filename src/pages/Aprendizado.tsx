
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Youtube, GraduationCap } from 'lucide-react';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

// Types for our data structure
type DisciplineCard = {
  id: string;
  nome: string;
  slug: string;
  progress: number;
  totalVideos: number;
  watchedVideos: number;
};

const Aprendizado = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState<DisciplineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchDisciplines();
    }
  }, [user]);

  // Create slug from discipline name
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  };

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all disciplines
      const { data: disciplinesData, error: disciplinesError } = await supabase
        .from('disciplina')
        .select('*')
        .order('nome');
        
      if (disciplinesError) throw disciplinesError;
      
      // 2. Get progress data for each discipline
      const disciplineCards: DisciplineCard[] = [];
      
      for (const discipline of disciplinesData) {
        // Get all videos for this discipline through topics
        const { data: videosData, error: videosError } = await supabase
          .from('video')
          .select(`
            id,
            topico!inner(
              disciplina_id
            )
          `)
          .eq('topico.disciplina_id', discipline.id);
          
        if (videosError) throw videosError;
        
        const totalVideos = videosData.length;
        
        // Get watched videos for current user
        const videoIds = videosData.map(v => v.id);
        let watchedVideos = 0;
        
        if (videoIds.length > 0) {
          const { data: watchedData, error: watchedError } = await supabase
            .from('video_assistido')
            .select('video_id')
            .eq('usuario_id', user.id)
            .in('video_id', videoIds);
            
          if (watchedError) throw watchedError;
          watchedVideos = watchedData.length;
        }
        
        const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;
        
        disciplineCards.push({
          id: discipline.id,
          nome: discipline.nome,
          slug: createSlug(discipline.nome),
          progress,
          totalVideos,
          watchedVideos
        });
      }
      
      setDisciplines(disciplineCards);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar disciplinas",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error fetching disciplines:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisciplineClick = (slug: string) => {
    navigate(`/aprendizado/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral"></div>
        <p className="mt-4 text-gray-600">Carregando disciplinas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <DashboardBreadcrumb currentPage="Trilha de Aprendizado" />
          
          <div className="flex items-center mb-8">
            <GraduationCap className="text-coral mr-3 h-8 w-8" />
            <h1 className="text-3xl font-bold text-gray-900">Trilha de Aprendizado</h1>
          </div>
          
          {disciplines.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Youtube className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma disciplina disponível</h3>
              <p className="text-gray-500">As disciplinas aparecerão aqui assim que forem criadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disciplines.map((discipline) => (
                <Card 
                  key={discipline.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-gray-100 rounded-2xl overflow-hidden"
                  onClick={() => handleDisciplineClick(discipline.slug)}
                >
                  <CardHeader className="bg-gradient-to-r from-coral/5 to-coral/10 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                      <Youtube className="h-6 w-6 mr-3 text-coral" />
                      {discipline.nome}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{discipline.watchedVideos} de {discipline.totalVideos} vídeos</span>
                        <span className="font-medium text-coral">{discipline.progress}%</span>
                      </div>
                      
                      <Progress 
                        value={discipline.progress} 
                        className="h-3"
                      />
                      
                      <div className="pt-2">
                        <p className="text-sm text-gray-500">
                          {discipline.progress === 100 
                            ? "Disciplina concluída! 🎉" 
                            : discipline.progress > 0 
                              ? "Continue seus estudos" 
                              : "Comece agora"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Aprendizado;
