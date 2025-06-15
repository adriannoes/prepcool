import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, Youtube, ArrowLeft } from 'lucide-react';
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

const AprendizadoDisciplina = () => {
  const { disciplina: disciplinaSlug } = useParams<{ disciplina: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discipline, setDiscipline] = useState<Disciplina | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  
  useEffect(() => {
    if (user && disciplinaSlug) {
      fetchDisciplineData();
    }
  }, [user, disciplinaSlug]);

  // Convert slug back to discipline name for search
  const slugToName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchDisciplineData = async () => {
    try {
      setLoading(true);
      
      if (!disciplinaSlug) {
        throw new Error('Disciplina não encontrada');
      }
      
      // Convert slug to searchable name
      const searchName = slugToName(disciplinaSlug);
      
      // Find discipline by name (case insensitive)
      const { data: disciplineData, error: disciplineError } = await supabase
        .from('disciplina')
        .select('*')
        .ilike('nome', `%${searchName}%`)
        .single();
        
      if (disciplineError) throw disciplineError;
      
      // Fetch topics for this discipline
      const { data: topicsData, error: topicsError } = await supabase
        .from('topico')
        .select('*')
        .eq('disciplina_id', disciplineData.id)
        .order('nome');
        
      if (topicsError) throw topicsError;
      
      // Fetch videos for these topics
      const topicIds = topicsData.map(t => t.id);
      const { data: videosData, error: videosError } = await supabase
        .from('video')
        .select('*')
        .in('topico_id', topicIds);
        
      if (videosError) throw videosError;
      
      // Fetch watched videos for current user
      const { data: watchedVideosData, error: watchedVideosError } = await supabase
        .from('video_assistido')
        .select('video_id')
        .eq('usuario_id', user.id);
        
      if (watchedVideosError) throw watchedVideosError;
      
      // Create a Set of watched video IDs for quick lookup
      const watchedVideoIds = new Set(watchedVideosData.map(wv => wv.video_id));
      
      // Build the nested structure
      const topicos = topicsData.map((topic) => {
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
      
      setDiscipline({
        id: disciplineData.id,
        nome: disciplineData.nome,
        topicos: topicos,
        progress: disciplineProgress
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar disciplina",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error fetching discipline:', error);
      navigate('/aprendizado');
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
        
        // Refresh the discipline data to update progress
        await fetchDisciplineData();
        
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
    // Extrai o ID do vídeo do YouTube a partir da URL
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral"></div>
        <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
      </div>
    );
  }

  if (!discipline) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <DashboardBreadcrumb 
              currentPage="Disciplina não encontrada"
              paths={[{ name: "Trilha de Aprendizado", path: "/aprendizado" }]}
            />
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Disciplina não encontrada</h3>
              <p className="text-gray-500 mb-4">A disciplina solicitada não existe ou foi removida.</p>
              <Button onClick={() => navigate('/aprendizado')} className="bg-coral hover:bg-coral/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Trilha de Aprendizado
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <DashboardBreadcrumb 
            currentPage={discipline.nome}
            paths={[{ name: "Trilha de Aprendizado", path: "/aprendizado" }]}
          />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Youtube className="text-coral mr-3 h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{discipline.nome}</h1>
                <p className="text-gray-600 mt-1">{discipline.progress}% concluído</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block w-48">
                <Progress value={discipline.progress} className="h-3" />
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/aprendizado')}
                className="border-coral text-coral hover:bg-coral/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
          
          {discipline.topicos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Youtube className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum tópico disponível</h3>
              <p className="text-gray-500">Os tópicos aparecerão aqui assim que forem criados.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {discipline.topicos.map((topic) => (
                <Card key={topic.id} className="overflow-hidden border-2 border-gray-100 rounded-2xl bg-white">
                  <CardHeader className="bg-gradient-to-r from-coral/5 to-coral/10 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold text-gray-900">{topic.nome}</CardTitle>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AprendizadoDisciplina;
