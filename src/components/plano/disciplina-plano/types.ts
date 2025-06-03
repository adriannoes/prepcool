export interface TopicoInfo {
  id: string;
  nome: string;
  disciplina: {
    id: string;
    nome: string;
  };
}

export interface PlanoItem {
  id: string;
  topico: TopicoInfo;
  prioridade: number;
  status: string;
  tipo: string;
  origem: string;
}

export interface DisciplinaInfo {
  id: string;
  nome: string;
  itens: PlanoItem[];
}

export interface DisciplinaPlanoProps {
  disciplina: DisciplinaInfo;
  filtroStatus: string | null;
}

export interface PlanoItemProps {
  item: PlanoItem;
  onMarcarConcluido: (itemId: string) => void;
  onNavigateToItem: (item: PlanoItem) => void;
  isUpdating: boolean;
}

export interface DisciplinaPlanoHeaderProps {
  nome: string;
}

export interface UseDisciplinaPlanoLogicProps {
  disciplina: DisciplinaInfo;
  filtroStatus: string | null;
}

export interface UseDisciplinaPlanoLogicReturn {
  itensExibidos: PlanoItem[];
  marcarComoConcluido: (itemId: string) => void;
  navigateToItem: (item: PlanoItem) => void;
  isUpdating: boolean;
  shouldRender: boolean;
} 