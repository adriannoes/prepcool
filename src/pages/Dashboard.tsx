
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DisciplineProgress from '@/components/dashboard/DisciplineProgress';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import SimuladoCard from '@/components/dashboard/SimuladoCard';
import RedacaoCard from '@/components/dashboard/RedacaoCard';
import DiagnosticoCard from '@/components/dashboard/DiagnosticoCard';
import DiagnosticoModal from '@/components/dashboard/DiagnosticoModal';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { 
    loading,
    disciplineProgress,
    simuladoProgress,
    redacaoProgress
  } = useDashboardData();

  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [checkingDiagnostic, setCheckingDiagnostic] = useState(true);

  useEffect(() => {
    // Only check if the user is logged in
    if (user) {
      const checkForExistingDiagnostic = async () => {
        try {
          const { data, error } = await supabase
            .from('diagnostico')
            .select('id')
            .eq('usuario_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking diagnostic:', error);
          }
          
          // If no diagnostic entry found, show the modal
          setShowDiagnosticModal(!data);
        } catch (err) {
          console.error('Failed to check diagnostic status:', err);
        } finally {
          setCheckingDiagnostic(false);
        }
      };
      
      checkForExistingDiagnostic();
    }
  }, [user]);

  // If we're still checking diagnostic status, show loading spinner
  if (checkingDiagnostic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600">Verificando seu perfil...</span>
      </div>
    );
  }

  // If diagnostic modal should be shown, don't render dashboard content yet
  if (showDiagnosticModal) {
    return (
      <div className="min-h-screen bg-[#F9F9F9]">
        <DiagnosticoModal 
          isOpen={showDiagnosticModal} 
          onComplete={() => setShowDiagnosticModal(false)} 
        />
      </div>
    );
  }

  // Otherwise render normal dashboard content
  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <DashboardHeader 
        userName={user?.user_metadata?.nome || "Estudante"} 
        onSignOut={signOut} 
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acompanhe seu progresso e continue seus estudos para alcançar seus objetivos
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Top section - Diagnostic and Study Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DiagnosticoCard />
            <StudyPlanCard />
          </div>
          
          {/* Middle section - Practice Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SimuladoCard 
              completed={simuladoProgress.completed} 
              total={simuladoProgress.total} 
            />
            <RedacaoCard
              submitted={redacaoProgress.submitted}
              averageScore={redacaoProgress.average_score}
            />
          </div>
          
          {/* Bottom section - Discipline Progress */}
          <div className="w-full">
            <DisciplineProgress disciplines={disciplineProgress} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
