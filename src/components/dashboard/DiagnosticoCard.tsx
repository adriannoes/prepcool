
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const DiagnosticoCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasDiagnostico, setHasDiagnostico] = useState<boolean | null>(null);
  const [diagnosticoDate, setDiagnosticoDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkDiagnostico = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('diagnostico')
          .select('data')
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        setHasDiagnostico(!!data);
        if (data?.data) {
          const date = new Date(data.data);
          setDiagnosticoDate(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date));
        }
      } catch (error) {
        console.error('Error checking diagnostico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDiagnostico();
  }, [user]);

  const handleAction = () => {
    navigate('/diagnostico');
  };

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Diagnóstico Inicial</CardTitle>
            <CardDescription>Seu perfil de estudos</CardDescription>
          </div>
          <FileCheck className="h-6 w-6 text-coral" />
        </CardHeader>
        <CardContent className="py-4">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-1 md:col-span-2 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Diagnóstico Inicial</CardTitle>
          <CardDescription>Seu perfil de estudos</CardDescription>
        </div>
        <FileCheck className="h-6 w-6 text-coral" />
      </CardHeader>
      <CardContent>
        {hasDiagnostico ? (
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Diagnóstico concluído
                </h3>
                <p className="text-gray-600">
                  Você já completou seu diagnóstico inicial. Seu plano de estudos está sendo personalizado com base em suas respostas.
                </p>
              </div>
              <Badge 
                className="mt-2 sm:mt-0 text-sm bg-green-100 text-green-800 border-none px-3 py-1"
              >
                Realizado em {diagnosticoDate}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <EmptyState 
              message="Você ainda não realizou o diagnóstico inicial para personalizar seu plano de estudos."
              icon={<FileCheck className="h-5 w-5" />}
              className="bg-[#F6F6F7] mt-2"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 bg-coral hover:bg-coral/90 text-white rounded-md px-4 py-2"
          onClick={handleAction}
        >
          {hasDiagnostico ? 'Atualizar Diagnóstico' : 'Realizar Diagnóstico'} 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiagnosticoCard;
