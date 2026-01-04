
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { logCreate, logUpdate, logDelete } from '@/utils/adminAudit';

interface Simulado {
  id: string;
  instituicao: string;
  ano: number;
  created_at: string;
}

interface Pergunta {
  id: string;
  enunciado: string;
  disciplina: string;
  alternativa_correta: string;
  simulado_id: string;
}

const SimuladoManager = () => {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [selectedSimulado, setSelectedSimulado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSimuladoForm, setShowSimuladoForm] = useState(false);
  const [showPerguntaForm, setShowPerguntaForm] = useState(false);
  const [editingSimuladoId, setEditingSimuladoId] = useState<string | null>(null);
  const [editingPerguntaId, setEditingPerguntaId] = useState<string | null>(null);
  
  const [simuladoForm, setSimuladoForm] = useState({
    instituicao: '',
    ano: new Date().getFullYear()
  });

  const [perguntaForm, setPerguntaForm] = useState({
    enunciado: '',
    disciplina: '',
    alternativa_correta: '',
    simulado_id: ''
  });

  useEffect(() => {
    fetchSimulados();
  }, []);

  useEffect(() => {
    if (selectedSimulado) {
      fetchPerguntas(selectedSimulado);
    }
  }, [selectedSimulado]);

  const fetchSimulados = async () => {
    try {
      const { data, error } = await supabase
        .from('simulado')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulados(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar simulados",
        description: "Não foi possível carregar os simulados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerguntas = async (simuladoId: string) => {
    try {
      const { data, error } = await supabase
        .from('pergunta')
        .select('*')
        .eq('simulado_id', simuladoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPerguntas(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar perguntas",
        description: "Não foi possível carregar as perguntas.",
        variant: "destructive"
      });
    }
  };

  const handleSimuladoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSimuladoId) {
        const { error } = await supabase
          .from('simulado')
          .update(simuladoForm)
          .eq('id', editingSimuladoId);

        if (error) throw error;
        
        // Log admin action
        await logUpdate('simulado', editingSimuladoId, { instituicao: simuladoForm.instituicao, ano: simuladoForm.ano });
        
        toast({ title: "Simulado atualizado com sucesso!" });
      } else {
        const { data, error } = await supabase
          .from('simulado')
          .insert([simuladoForm])
          .select()
          .single();

        if (error) throw error;
        
        // Log admin action
        if (data?.id) {
          await logCreate('simulado', data.id, { instituicao: simuladoForm.instituicao, ano: simuladoForm.ano });
        }
        
        toast({ title: "Simulado criado com sucesso!" });
      }

      setSimuladoForm({ instituicao: '', ano: new Date().getFullYear() });
      setShowSimuladoForm(false);
      setEditingSimuladoId(null);
      fetchSimulados();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o simulado.",
        variant: "destructive"
      });
    }
  };

  const handlePerguntaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSimulado) return;
    
    const perguntaData = { ...perguntaForm, simulado_id: selectedSimulado };
    
    try {
      if (editingPerguntaId) {
        const { error } = await supabase
          .from('pergunta')
          .update(perguntaData)
          .eq('id', editingPerguntaId);

        if (error) throw error;
        
        // Log admin action
        await logUpdate('pergunta', editingPerguntaId, { disciplina: perguntaForm.disciplina, simulado_id: selectedSimulado });
        
        toast({ title: "Pergunta atualizada com sucesso!" });
      } else {
        const { data, error } = await supabase
          .from('pergunta')
          .insert([perguntaData])
          .select()
          .single();

        if (error) throw error;
        
        // Log admin action
        if (data?.id) {
          await logCreate('pergunta', data.id, { disciplina: perguntaForm.disciplina, simulado_id: selectedSimulado });
        }
        
        toast({ title: "Pergunta criada com sucesso!" });
      }

      setPerguntaForm({ enunciado: '', disciplina: '', alternativa_correta: '', simulado_id: '' });
      setShowPerguntaForm(false);
      setEditingPerguntaId(null);
      fetchPerguntas(selectedSimulado);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a pergunta.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSimulado = async (id: string) => {
    if (!confirm('Tem certeza? Isso excluirá o simulado e todas as suas perguntas.')) return;

    try {
      const { error } = await supabase
        .from('simulado')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log admin action
      await logDelete('simulado', id);
      
      toast({ title: "Simulado excluído com sucesso!" });
      fetchSimulados();
      if (selectedSimulado === id) {
        setSelectedSimulado(null);
        setPerguntas([]);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o simulado.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePergunta = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('pergunta')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log admin action
      await logDelete('pergunta', id);
      
      toast({ title: "Pergunta excluída com sucesso!" });
      if (selectedSimulado) {
        fetchPerguntas(selectedSimulado);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pergunta.",
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
        <h2 className="text-2xl font-bold text-gray-800">Simulados</h2>
        <Button
          onClick={() => {
            setSimuladoForm({ instituicao: '', ano: new Date().getFullYear() });
            setEditingSimuladoId(null);
            setShowSimuladoForm(true);
          }}
          className="bg-coral hover:bg-coral/90"
        >
          <Plus size={16} className="mr-2" />
          Novo Simulado
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulados List */}
        <div>
          {showSimuladoForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{editingSimuladoId ? 'Editar' : 'Criar'} Simulado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSimuladoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Instituição</label>
                    <Input
                      value={simuladoForm.instituicao}
                      onChange={(e) => setSimuladoForm({ ...simuladoForm, instituicao: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ano</label>
                    <Input
                      type="number"
                      value={simuladoForm.ano}
                      onChange={(e) => setSimuladoForm({ ...simuladoForm, ano: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-coral hover:bg-coral/90">
                      {editingSimuladoId ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowSimuladoForm(false);
                        setEditingSimuladoId(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {simulados.map((simulado) => (
              <Card key={simulado.id} className={selectedSimulado === simulado.id ? 'ring-2 ring-coral' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{simulado.instituicao}</h3>
                      <p className="text-gray-600 text-sm">Ano: {simulado.ano}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSimulado(simulado.id)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSimuladoForm({ instituicao: simulado.instituicao, ano: simulado.ano });
                          setEditingSimuladoId(simulado.id);
                          setShowSimuladoForm(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSimulado(simulado.id)}
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

        {/* Perguntas List */}
        <div>
          {selectedSimulado && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Perguntas</h3>
                <Button
                  onClick={() => {
                    setPerguntaForm({ enunciado: '', disciplina: '', alternativa_correta: '', simulado_id: '' });
                    setEditingPerguntaId(null);
                    setShowPerguntaForm(true);
                  }}
                  className="bg-coral hover:bg-coral/90"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Nova Pergunta
                </Button>
              </div>

              {showPerguntaForm && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>{editingPerguntaId ? 'Editar' : 'Criar'} Pergunta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePerguntaSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Disciplina</label>
                        <Input
                          value={perguntaForm.disciplina}
                          onChange={(e) => setPerguntaForm({ ...perguntaForm, disciplina: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Enunciado</label>
                        <Textarea
                          value={perguntaForm.enunciado}
                          onChange={(e) => setPerguntaForm({ ...perguntaForm, enunciado: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Alternativa Correta</label>
                        <Input
                          value={perguntaForm.alternativa_correta}
                          onChange={(e) => setPerguntaForm({ ...perguntaForm, alternativa_correta: e.target.value })}
                          placeholder="A, B, C, D ou E"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-coral hover:bg-coral/90">
                          {editingPerguntaId ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPerguntaForm(false);
                            setEditingPerguntaId(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {perguntas.map((pergunta, index) => (
                  <Card key={pergunta.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-coral text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-coral">
                              {pergunta.disciplina}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{pergunta.enunciado}</p>
                          <p className="text-xs text-gray-600">
                            Resposta: {pergunta.alternativa_correta}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPerguntaForm({
                                enunciado: pergunta.enunciado,
                                disciplina: pergunta.disciplina,
                                alternativa_correta: pergunta.alternativa_correta,
                                simulado_id: pergunta.simulado_id
                              });
                              setEditingPerguntaId(pergunta.id);
                              setShowPerguntaForm(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePergunta(pergunta.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimuladoManager;
