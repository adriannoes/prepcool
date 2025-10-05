
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, Youtube } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

// Types for our data structure
type Video = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  watched?: boolean;
};

type Topico = {
  id: string;
  nome: string;
  videos: Video[];
  progress: number;
};

type Disciplina = {
  id: string;
  nome: string;
  topicos: Topico[];
  progress: number;
};

const Aprendizado = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchDisciplines();
    }
  }, [user]);

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all disciplines
      const { data: disciplinesData, error: disciplinesError } = await supabase
        .from('disciplina')
        .select('*')
        .order('nome');
        
      if (disciplinesError) throw disciplinesError;
      
      // 2. Fetch all topics for these disciplines
      const { data: topicsData, error: topicsError } = await supabase
        .from('topico')
        .select('*')
        .order('nome');
        
      if (topicsError) throw topicsError;
      
      // 3. Fetch all videos for these topics
      const { data: videosData, error: videosError } = await supabase
        .from('video')
        .select('*');
        
      if (videosError) throw videosError;
      
      // 4. Fetch watched videos for current user
      const { data: watchedVideosData, error: watchedVideosError } = await supabase
        .from('video_assistido')
        .select('video_id')
        .eq('usuario_id', user.id);
        
      if (watchedVideosError) throw watchedVideosError;
      
      // Create a Set of watched video IDs for quick lookup
      const watchedVideoIds = new Set(watchedVideosData.map(wv => wv.video_id));
      
      // Build the nested structure
      const structuredDisciplines: Disciplina[] = disciplinesData.map((discipline) => {
        const disciplineTopics = topicsData.filter(topic => topic.disciplina_id === discipline.id);
        
        const topicos = disciplineTopics.map((topic) => {
          const topicVideos = videosData
            .filter(video => video.topico_id === topic.id)
            .map(video => ({
              ...video,
              watched: watchedVideoIds.has(video.id)
            }));
            
          // Calculate topic progress
          const totalVideos = topicVideos.length;
          const watchedVideos = topicVideos.filter(v => v.watched).length;
          const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;
          
          return {
            id: topic.id,
            nome: topic.nome,
            videos: topicVideos,
            progress: progress
          };
        });
        
        // Calculate discipline progress
        const allVideos = topicos.flatMap(t => t.videos);
        const totalDisciplineVideos = allVideos.length;
        const watchedDisciplineVideos = allVideos.filter(v => v.watched).length;
        const disciplineProgress = totalDisciplineVideos > 0 ? 
          Math.round((watchedDisciplineVideos / totalDisciplineVideos) * 100) : 0;
        
        return {
          id: discipline.id,
          nome: discipline.nome,
          topicos: topicos,
          progress: disciplineProgress
        };
      });
      
      setDisciplines(structuredDisciplines);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conteúdo",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVideoComplete = async (videoId: string) => {
    try {
      // Check if video is already marked as watched
      const { data: existingData } = await supabase
        .from('video_assistido')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();
      
      // If not watched yet, insert new record
      if (!existingData) {
        const { error } = await supabase
          .from('video_assistido')
          .insert({
            usuario_id: user.id,
            video_id: videoId,
            watched_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        // Update local state to reflect the watched video
        setDisciplines(prevDisciplines => {
          return prevDisciplines.map(discipline => ({
            ...discipline,
            topicos: discipline.topicos.map(topic => ({
              ...topic,
              videos: topic.videos.map(video => 
                video.id === videoId ? { ...video, watched: true } : video
              )
            }))
          }));
        });
        
        toast({
          title: "Vídeo concluído",
          description: "Seu progresso foi salvo com sucesso!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar progresso",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error marking video as watched:', error);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    // For testing, always return the test video
    return "iMjfKNu-2x0";
    
    // In production, we would parse the URL:
    // const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    // const match = url.match(regExp);
    // return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E60CE]"></div>
        <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Youtube className="text-[#5E60CE] mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Trilha de Aprendizado</h1>
          </div>
          
          {disciplines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Ainda não há disciplinas disponíveis.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {disciplines.map((discipline) => (
                <AccordionItem
                  key={discipline.id}
                  value={discipline.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="text-lg font-medium">{discipline.nome}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="hidden md:block w-40">
                          <Progress value={discipline.progress} className="h-2" />
                        </div>
                        <span className="text-sm text-gray-500">{discipline.progress}%</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 py-2">
                    <div className="space-y-6">
                      {discipline.topicos.map((topic) => (
                        <Card key={topic.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-md font-medium">{topic.nome}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <Progress value={topic.progress} className="w-24 h-2" />
                                <Badge variant={topic.progress === 100 ? "default" : "secondary"}>
                                  {topic.progress === 100 ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Concluído</>
                                  ) : (
                                    <><Clock className="h-3 w-3 mr-1" /> Em progresso</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              {topic.videos.map((video) => (
                                <div key={video.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">{video.titulo}</h4>
                                    {video.watched ? (
                                      <Badge variant="default" className="flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Assistido
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pendente
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {video.descricao && (
                                    <p className="text-sm text-gray-500">{video.descricao}</p>
                                  )}
                                  
                                  <div className="relative pt-[56.25%] rounded-md overflow-hidden">
                                    <iframe
                                      className="absolute inset-0 w-full h-full"
                                      src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                                      title={video.titulo}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      onEnded={() => handleVideoComplete(video.id)}
                                    ></iframe>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleVideoComplete(video.id)}
                                    disabled={video.watched}
                                  >
                                    {video.watched ? 'Já Assistido' : 'Marcar como Assistido'}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default Aprendizado;
