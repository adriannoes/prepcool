
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Check, Clock } from 'lucide-react';

interface TopicoInfo {
  id: string;
  nome: string;
  disciplina: {
    id: string;
    nome: string;
  };
}

interface PlanoHistoricoItem {
  id: string;
  topico: TopicoInfo;
  prioridade: number;
  status: string;
  tipo: string;
  origem: string;
  created_at: string;
}

interface PlanoHistoricoGroup {
  origem: string;
  itens: PlanoHistoricoItem[];
}

interface PlanoHistoricoGroupProps {
  grupo: PlanoHistoricoGroup;
}

const PlanoHistoricoGroup = ({ grupo }: PlanoHistoricoGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const getOrigemDisplayName = (origem: string) => {
    if (origem === 'diagnostico') {
      return 'Diagnóstico';
    }
    return `Simulado ${origem}`;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'concluido') {
      return <Check className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'concluido') {
      return <Badge variant="default" className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Concluído</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">Pendente</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'video') {
      return <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Vídeo</Badge>;
    }
    return <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">Exercício</Badge>;
  };

  const completedCount = grupo.itens.filter(item => item.status === 'concluido').length;
  const totalCount = grupo.itens.length;

  return (
    <div className="bg-white rounded-2xl shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-6 text-left hover:bg-gray-50 transition-colors rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getOrigemDisplayName(grupo.origem)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completedCount} de {totalCount} tópicos concluídos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {Math.round((completedCount / totalCount) * 100)}% concluído
                </div>
                <div className="w-32 bg-gray-100 rounded-full h-3 mt-2">
                  <div 
                    className="bg-[#5E60CE] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {grupo.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <button
                        onClick={() => navigate('/aprendizado')}
                        className="text-left hover:text-[#5E60CE] transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900 hover:underline">
                          {item.topico.nome}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.topico.disciplina.nome}
                        </p>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getTipoBadge(item.tipo)}
                    {getStatusBadge(item.status)}
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        Atribuído em
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoHistoricoGroup;
