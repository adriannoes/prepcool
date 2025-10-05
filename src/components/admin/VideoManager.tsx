import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  topico_id: string;
  created_at: string;
  topico?: {
    nome: string;
    disciplina?: {
      nome: string;
    };
  };
}

interface Disciplina {
  id: string;
  nome: string;
}

interface Topico {
  id: string;
  nome: string;
  disciplina_id: string;
}

const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    url: '',
    topico_id: ''
  });

  const updateBotanicaVideo = useCallback(async () => {
    try {
      // Procurar pelo vídeo de "Introdução à Botânica"
      const { data: videos, error } = await supabase
        .from('video')
        .select('*')
        .ilike('titulo', '%introdução%botânica%')
        .or('titulo.ilike.%intro%botânica%,titulo.ilike.%botânica%introdução%');

      if (error) {
        console.error('Erro ao buscar vídeo de botânica:', error);
        return;
      }

      if (videos && videos.length > 0) {
        const botanicaVideo = videos[0];
        const newUrl = 'https://www.youtube.com/watch?v=1ra4GNjN2jQ';

        // Verificar se o URL já está atualizado
        if (botanicaVideo.url !== newUrl) {
          const { error: updateError } = await supabase
            .from('video')
            .update({ url: newUrl })
            .eq('id', botanicaVideo.id);

          if (updateError) {
            console.error('Erro ao atualizar vídeo:', updateError);
          } else {
            console.log('✅ Vídeo de Introdução à Botânica atualizado com sucesso!');
            toast({
              title: "Vídeo atualizado!",
              description: "O link do vídeo de Introdução à Botânica foi atualizado automaticamente.",
            });
            // Recarregar os dados para mostrar a mudança
            fetchData();
          }
        }
      }
    } catch (error) {
      console.error('Erro na atualização automática:', error);
    }
  }, [toast]);

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, disciplinasRes, topicosRes] = await Promise.all([
        supabase
          .from('video')
          .select(`
            *,
            topico:topico_id (
              nome,
              disciplina:disciplina_id (
                nome
              )
            )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('disciplina').select('*').order('nome'),
        supabase.from('topico').select('*').order('nome')
      ]);

      if (videosRes.error) throw videosRes.error;
      if (disciplinasRes.error) throw disciplinasRes.error;
      if (topicosRes.error) throw topicosRes.error;

      setVideos(videosRes.data || []);
      setDisciplinas(disciplinasRes.data || []);
      setTopicos(topicosRes.data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os vídeos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    updateBotanicaVideo();
  }, [fetchData, updateBotanicaVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('video')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Vídeo atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('video')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Vídeo criado com sucesso!" });
      }

      setFormData({ titulo: '', descricao: '', url: '', topico_id: '' });
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o vídeo.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (video: Video) => {
    setFormData({
      titulo: video.titulo,
      descricao: video.descricao || '',
      url: video.url,
      topico_id: video.topico_id
    });
    setEditingId(video.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const { error } = await supabase
        .from('video')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Vídeo excluído com sucesso!" });
      fetchData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o vídeo.",
        variant: "destructive"
      });
    }
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <div className="flex justify-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vídeos de Aprendizado</h2>
        <Button
          onClick={() => {
            setFormData({ titulo: '', descricao: '', url: '', topico_id: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-coral hover:bg-coral/90"
        >
          <Plus size={16} className="mr-2" />
          Novo Vídeo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Criar'} Vídeo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Vídeo</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tópico</label>
                <Select 
                  value={formData.topico_id} 
                  onValueChange={(value) => setFormData({ ...formData, topico_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tópico" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicos.map((topico) => {
                      const disciplina = disciplinas.find(d => d.id === topico.disciplina_id);
                      return (
                        <SelectItem key={topico.id} value={topico.id}>
                          {disciplina?.nome} - {topico.nome}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-coral hover:bg-coral/90">
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{video.titulo}</h3>
                  <p className="text-coral text-sm mb-2">
                    {video.topico?.disciplina?.nome} - {video.topico?.nome}
                  </p>
                  {video.descricao && (
                    <p className="text-gray-600 text-sm mb-2">{video.descricao}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      {video.url}
                    </a>
                  </div>
                  {getYouTubeId(video.url) && (
                    <div className="mt-3">
                      <div className="relative w-full max-w-sm aspect-video">
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                          title={video.titulo}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoManager;
