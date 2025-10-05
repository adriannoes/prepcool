
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Mock data
const mockDisciplines = [
  { id: 1, name: 'Matemática', progress: 65, total: 100 },
  { id: 2, name: 'Física', progress: 45, total: 100 },
  { id: 3, name: 'Química', progress: 80, total: 100 },
  { id: 4, name: 'Biologia', progress: 30, total: 100 },
  { id: 5, name: 'História', progress: 50, total: 100 },
  { id: 6, name: 'Geografia', progress: 25, total: 100 }
];

const mockSimulados = [
  { id: 1, title: 'ENEM 2023', date: '10/11/2023', status: 'completed', score: 780 },
  { id: 2, title: 'FUVEST 2024', date: '15/12/2023', status: 'scheduled' },
];

const mockRedacoes = [
  { id: 1, title: 'O papel da educação na transformação social', date: '05/10/2023', status: 'corrected', score: 900 },
  { id: 2, title: 'Desafios da sustentabilidade no século XXI', date: '20/10/2023', status: 'pending' },
];

const mockStudyPlan = {
  todayFocus: 'Matemática - Funções Trigonométricas',
  completionPercentage: 35,
  nextTopics: ['Física - Leis de Newton', 'Química - Equilíbrio Químico', 'Literatura - Modernismo']
};

// Mock API calls
const fetchDisciplines = (): Promise<typeof mockDisciplines> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDisciplines), 800);
  });
};

const fetchSimulados = (): Promise<typeof mockSimulados> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSimulados), 1000);
  });
};

const fetchRedacoes = (): Promise<typeof mockRedacoes> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRedacoes), 900);
  });
};

const fetchStudyPlan = (): Promise<typeof mockStudyPlan> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockStudyPlan), 700);
  });
};

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: disciplines = [], isLoading: isDisciplinesLoading } = useQuery({
    queryKey: ['disciplines'],
    queryFn: fetchDisciplines,
  });

  const { data: simulados = [], isLoading: isSimuladosLoading } = useQuery({
    queryKey: ['simulados'],
    queryFn: fetchSimulados,
  });

  const { data: redacoes = [], isLoading: isRedacoesLoading } = useQuery({
    queryKey: ['redacoes'],
    queryFn: fetchRedacoes,
  });

  const { data: studyPlan, isLoading: isStudyPlanLoading } = useQuery({
    queryKey: ['studyPlan'],
    queryFn: fetchStudyPlan,
  });

  // Transform study plan completion percentage to string for Progress component
  const studyPlanCompletion = studyPlan ? studyPlan.completionPercentage.toString() : "0";

  return {
    loading: isDisciplinesLoading || isSimuladosLoading || isRedacoesLoading || isStudyPlanLoading,
    disciplineProgress: disciplines,
    simuladoProgress: {
      completed: simulados.filter(s => s.status === 'completed').length,
      total: simulados.length
    },
    redacaoProgress: {
      submitted: redacoes.length,
      average_score: redacoes.filter(r => r.status === 'corrected').length > 0
        ? Math.round(redacoes.filter(r => r.status === 'corrected' && r.score).reduce((acc, cur) => acc + (cur.score || 0), 0) / 
          redacoes.filter(r => r.status === 'corrected').length)
        : 0
    }
  };
};
