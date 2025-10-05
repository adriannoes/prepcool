
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SimuladoQuestion from '@/components/simulado/SimuladoQuestion';

const Simulado = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!id) {
    return <Navigate to="/simulado" />;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SimuladoQuestion simuladoId={id} />
    </div>
  );
};

export default Simulado;
