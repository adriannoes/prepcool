
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        userName={user?.user_metadata?.nome || "Estudante"} 
        onSignOut={signOut} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First row */}
          <DiagnosticoCard />
          <StudyPlanCard />
          
          {/* Second row */}
          <div className="col-span-1 md:col-span-2">
            <DisciplineProgress disciplines={disciplineProgress} />
          </div>
          <div className="col-span-1">
            <SimuladoCard 
              completed={simuladoProgress.completed} 
              total={simuladoProgress.total} 
            />
          </div>
          
          {/* Third row */}
          <div className="col-span-1 md:col-span-3">
            <RedacaoCard
              submitted={redacaoProgress.submitted}
              averageScore={redacaoProgress.average_score}
            />
          </div>
        </div>
      </main>

      {/* Show DiagnosticoModal conditionally */}
      {showDiagnosticModal && !checkingDiagnostic && (
        <DiagnosticoModal isOpen={showDiagnosticModal} />
      )}
    </div>
  );
};

export default Dashboard;
