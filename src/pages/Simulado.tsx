
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SimuladoQuestion from '@/components/simulado/SimuladoQuestion';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Simulado = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!id) {
    return <Navigate to="/simulado" />;
  }

  // Function to call when simulado is completed
  const onSimuladoComplete = async () => {
    try {
      // Call the simuladoDone edge function to generate study plan
      const { data, error } = await supabase.functions.invoke('simuladoDone', {
        body: { 
          simulado_id: id,
          usuario_id: user.id
        }
      });
      
      if (error) {
        console.error('Error calling simuladoDone:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível gerar o plano de estudos personalizado.',
          variant: 'destructive'
        });
        return;
      }
      
      // Show success message
      toast({
        title: 'Simulado enviado com sucesso!',
        description: data.message || 'Seu plano de estudos foi atualizado.',
      });
    } catch (err) {
      console.error('Failed to process simulado completion:', err);
      toast({
        title: 'Erro',
        description: 'Tivemos um problema ao processar seu simulado. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Simulado em Andamento"
        paths={[{ name: 'Simulados', path: '/simulado' }]}
      />
      
      <SimuladoQuestion 
        simuladoId={id}
        onComplete={onSimuladoComplete} 
      />
    </div>
  );
};

export default Simulado;
