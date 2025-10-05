
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ModeloRedacao {
  id: string;
  instituicao: string;
  tema: string;
  exemplo: string;
  created_at: string;
}

const RedacaoManager = () => {
  const [modelos, setModelos] = useState<ModeloRedacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    instituicao: '',
    tema: '',
    exemplo: ''
  });

  useEffect(() => {
    fetchModelos();
  }, []);

  const fetchModelos = async () => {
    try {
      const { data, error } = await supabase
        .from('modelo_redacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModelos(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar modelos",
        description: "Não foi possível carregar os modelos de redação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('modelo_redacao')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Modelo atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('modelo_redacao')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Modelo criado com sucesso!" });
      }

      setFormData({ instituicao: '', tema: '', exemplo: '' });
      setShowForm(false);
      setEditingId(null);
      fetchModelos();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o modelo.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (modelo: ModeloRedacao) => {
    setFormData({
      instituicao: modelo.instituicao,
      tema: modelo.tema,
      exemplo: modelo.exemplo
    });
    setEditingId(modelo.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return;

    try {
      const { error } = await supabase
        .from('modelo_redacao')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Modelo excluído com sucesso!" });
      fetchModelos();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o modelo.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Modelos de Redação</h2>
        <Button
          onClick={() => {
            setFormData({ instituicao: '', tema: '', exemplo: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-coral hover:bg-coral/90"
        >
          <Plus size={16} className="mr-2" />
          Novo Modelo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Criar'} Modelo de Redação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Instituição</label>
                <Input
                  value={formData.instituicao}
                  onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tema</label>
                <Input
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Exemplo</label>
                <Textarea
                  value={formData.exemplo}
                  onChange={(e) => setFormData({ ...formData, exemplo: e.target.value })}
                  rows={6}
                  required
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
        {modelos.map((modelo) => (
          <Card key={modelo.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{modelo.tema}</h3>
                  <p className="text-gray-600 mb-2">{modelo.instituicao}</p>
                  <p className="text-sm text-gray-500 line-clamp-3">{modelo.exemplo}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(modelo)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(modelo.id)}
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

export default RedacaoManager;
