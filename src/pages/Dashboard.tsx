
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DisciplineProgress from '@/components/dashboard/DisciplineProgress';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import SimuladoCard from '@/components/dashboard/SimuladoCard';
import RedacaoCard from '@/components/dashboard/RedacaoCard';
import DiagnosticoCard from '@/components/dashboard/DiagnosticoCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import useDashboardData from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    simulados, 
    ultimasRedacoes
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First row */}
          <DiagnosticoCard />
          <StudyPlanCard />
          
          {/* Second row */}
          <div className="col-span-1 md:col-span-2">
            <DisciplineProgress />
          </div>
          <div className="col-span-1">
            <SimuladoCard simulados={simulados} loading={isLoading} />
          </div>
          
          {/* Third row */}
          <div className="col-span-1 md:col-span-3">
            <RedacaoCard redacoes={ultimasRedacoes} loading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
