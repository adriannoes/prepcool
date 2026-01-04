import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { error as logError } from '@/utils/logger';

interface PlanoEstudo {
  id: string;
  usuario_id: string;
  topico_id: string;
  prioridade: number;
  tipo: string;
  status: string;
  origem: string;
  created_at: string;
  topico?: {
    nome: string;
    disciplina?: {
      nome: string;
    };
  };
  usuario?: {
    nome: string;
    email: string;
  } | null;
}

const PlanoViewer = () => {
  const [planos, setPlanos] = useState<PlanoEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('plano_estudo')
        .select(`
          *,
          topico:topico_id (
            nome,
            disciplina:disciplina_id (
              nome
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user data separately to avoid join issues
      const planosWithUsers = await Promise.all(
        (data || []).map(async (plano) => {
          const { data: userData } = await supabase
            .from('usuario')
            .select('nome, email')
            .eq('id', plano.usuario_id)
            .single();

          return {
            ...plano,
            usuario: userData || null
          };
        })
      );

      setPlanos(planosWithUsers);
    } catch (error) {
      logError('Error fetching planos:', error);
      toast({
        title: "Erro ao carregar planos",
        description: "Não foi possível carregar os planos de estudo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlanos = planos.filter(plano => {
    const matchesSearch = 
      plano.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.topico?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.topico?.disciplina?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plano.status === statusFilter;
    const matchesTipo = tipoFilter === 'all' || plano.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_progresso':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'diagnostico':
        return 'bg-coral/10 text-coral';
      case 'simulado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Planos de Estudo</h2>
        <div className="text-sm text-gray-600">
          {filteredPlanos.length} plano(s) encontrado(s)
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Nome, email, tópico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos List */}
      <div className="space-y-4">
        {filteredPlanos.map((plano) => (
          <Card key={plano.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {plano.usuario?.nome || 'Usuário não encontrado'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({plano.usuario?.email || 'Email não disponível'})
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tópico:</p>
                      <p className="font-medium">
                        {plano.topico?.disciplina?.nome || 'Disciplina'} - {plano.topico?.nome || 'Tópico não encontrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tipo:</p>
                      <p className="font-medium capitalize">{plano.tipo}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plano.status)}`}>
                      {plano.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrigemColor(plano.origem)}`}>
                      {plano.origem}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Prioridade: {plano.prioridade}
                    </span>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlanos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum plano de estudo encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlanoViewer;
