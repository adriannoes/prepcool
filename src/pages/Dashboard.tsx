
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DisciplineProgress from '@/components/dashboard/DisciplineProgress';
import SimuladoCard from '@/components/dashboard/SimuladoCard';
import RedacaoCard from '@/components/dashboard/RedacaoCard';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    loading,
    disciplineProgress,
    simuladoProgress,
    redacaoProgress
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-off-white p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <DashboardHeader 
            userName={user?.user_metadata?.nome || 'Estudante'} 
            onSignOut={signOut} 
          />
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisciplineProgress disciplines={disciplineProgress} />
              <SimuladoCard 
                completed={simuladoProgress.completed} 
                total={simuladoProgress.total} 
              />
              <RedacaoCard 
                submitted={redacaoProgress.submitted} 
                averageScore={redacaoProgress.average_score} 
              />
              <StudyPlanCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
