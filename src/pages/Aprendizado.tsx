
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, Youtube } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
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
  const location = useLocation();
  const accordionRefs = useRef<Record<string, HTMLElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | HTMLIFrameElement | null>>({});
  
  // Extract discipline from query parameters
  const queryParams = new URLSearchParams(location.search);
  const targetDiscipline = queryParams.get('disciplina');
  
  useEffect(() => {
    if (user) {
      fetchDisciplines();
    }
  }, [user]);

  useEffect(() => {
    // If targetDiscipline is set and disciplines are loaded, scroll to that discipline
    if (!loading && targetDiscipline && accordionRefs.current[targetDiscipline]) {
      const disciplineElement = accordionRefs.current[targetDiscipline];
      if (disciplineElement) {
        setTimeout(() => {
          disciplineElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Find the accordion trigger and click it to open that section
          const trigger = disciplineElement.querySelector('[data-accordion-trigger]');
          if (trigger && trigger instanceof HTMLElement) {
            trigger.click();
          }
        }, 100);
      }
    }
  }, [loading, targetDiscipline, disciplines]);

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
            topicos: discipline.topicos.map(topic => {
              const updatedVideos = topic.videos.map(video => 
                video.id === videoId ? { ...video, watched: true } : video
              );
              
              // Recalculate topic progress
              const totalVideos = updatedVideos.length;
              const watchedVideos = updatedVideos.filter(v => v.watched).length;
              const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;
              
              return {
                ...topic,
                videos: updatedVideos,
                progress: progress
              };
            })
          })).map(discipline => {
            // Recalculate discipline progress
            const allVideos = discipline.topicos.flatMap(t => t.videos);
            const totalDisciplineVideos = allVideos.length;
            const watchedDisciplineVideos = allVideos.filter(v => v.watched).length;
            const disciplineProgress = totalDisciplineVideos > 0 ? 
              Math.round((watchedDisciplineVideos / totalDisciplineVideos) * 100) : 0;
            
            return {
              ...discipline,
              progress: disciplineProgress
            };
          });
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

  // Handle video progress tracking for YouTube videos
  const handleVideoProgress = (videoId: string, iframe: HTMLIFrameElement) => {
    // Listen for YouTube player events using postMessage API
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'video-progress' && data.info?.currentTime && data.info?.duration) {
          const progress = data.info.currentTime / data.info.duration;
          if (progress >= 0.9) { // 90% completion
            handleVideoComplete(videoId);
          }
        }
      } catch (error) {
        // Silently handle parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral"></div>
        <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <DashboardBreadcrumb currentPage="Aprendizado" />
          
          <div className="flex items-center mb-8">
            <Youtube className="text-coral mr-3 h-8 w-8" />
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
            <Accordion type="multiple" className="space-y-6">
              {disciplines.map((discipline) => (
                <AccordionItem
                  key={discipline.id}
                  value={discipline.id}
                  className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  ref={(el) => {
                    // Store references to all disciplines for scrolling
                    accordionRefs.current[discipline.nome] = el;
                  }}
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors" data-accordion-trigger>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="text-xl font-semibold text-gray-900">{discipline.nome}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="hidden md:block w-48">
                          <Progress value={discipline.progress} className="h-3" />
                        </div>
                        <Badge variant={discipline.progress === 100 ? "default" : "secondary"} className="px-3 py-1 text-sm">
                          {discipline.progress}% concluído
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 py-4 bg-gray-50">
                    <div className="space-y-6">
                      {discipline.topicos.map((topic) => (
                        <Card key={topic.id} className="overflow-hidden border-2 border-gray-100 rounded-2xl bg-white">
                          <CardHeader className="bg-gradient-to-r from-coral/5 to-coral/10 py-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg font-semibold text-gray-900">{topic.nome}</CardTitle>
                              <div className="flex items-center space-x-3">
                                <Progress value={topic.progress} className="w-32 h-3" />
                                <Badge variant={topic.progress === 100 ? "default" : "secondary"} className="px-3 py-1">
                                  {topic.progress === 100 ? (
                                    <><CheckCircle className="h-4 w-4 mr-1" /> Concluído</>
                                  ) : (
                                    <><Clock className="h-4 w-4 mr-1" /> Em progresso</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {topic.videos.map((video) => (
                                <div key={video.id} className={`space-y-4 p-4 rounded-xl border-2 transition-all ${
                                  video.watched 
                                    ? 'border-green-200 bg-green-50' 
                                    : 'border-gray-100 bg-white'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">{video.titulo}</h4>
                                    {video.watched ? (
                                      <Badge className="flex items-center bg-green-100 text-green-800 hover:bg-green-100">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Assistido
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        Pendente
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {video.descricao && (
                                    <p className="text-gray-600 leading-relaxed">{video.descricao}</p>
                                  )}
                                  
                                  <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-gray-100">
                                    <iframe
                                      ref={(el) => {
                                        videoRefs.current[video.id] = el;
                                        if (el) {
                                          handleVideoProgress(video.id, el);
                                        }
                                      }}
                                      className="absolute inset-0 w-full h-full"
                                      src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}?enablejsapi=1`}
                                      title={video.titulo}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                  
                                  <Button
                                    variant={video.watched ? "secondary" : "default"}
                                    size="lg"
                                    className={`w-full h-12 text-base font-medium ${
                                      video.watched 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : 'bg-coral hover:bg-coral/90'
                                    }`}
                                    onClick={() => handleVideoComplete(video.id)}
                                    disabled={video.watched}
                                  >
                                    {video.watched ? (
                                      <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Já Assistido
                                      </>
                                    ) : (
                                      'Marcar como Assistido'
                                    )}
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
