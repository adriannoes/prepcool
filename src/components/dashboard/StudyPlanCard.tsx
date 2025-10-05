
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from './EmptyState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const StudyPlanCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: planItems, isLoading } = useQuery({
    queryKey: ['study-plan-preview'],
    queryFn: async () => {
      if (!user) return { count: 0, pendingItems: [] };
      
      // Get count of study plan items
      const { count, error: countError } = await supabase
        .from('plano_estudo')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('status', 'pendente');
        
      if (countError) throw countError;
      
      // Get a few recent items for preview
      const { data: pendingItems, error: itemsError } = await supabase
        .from('plano_estudo')
        .select('*, topico(*)')
        .eq('usuario_id', user.id)
        .eq('status', 'pendente')
        .order('prioridade', { ascending: true })
        .limit(3);
        
      if (itemsError) throw itemsError;
      
      return { count: count || 0, pendingItems: pendingItems || [] };
    },
    enabled: !!user,
  });
  
  const hasStudyPlan = !isLoading && planItems && planItems.count > 0;
  const recommendedTopics = planItems?.count || 0;
  
  return (
    <Card className="col-span-1 md:col-span-2 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Plano de Estudos</CardTitle>
          <CardDescription>Recomendações personalizadas</CardDescription>
        </div>
        <TrendingUp className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="sm" />
          </div>
        ) : hasStudyPlan ? (
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Plano personalizado disponível
                </h3>
                <p className="text-gray-600">
                  {recommendedTopics} tópicos recomendados com base no seu desempenho
                </p>
              </div>
              <Badge 
                className="mt-2 sm:mt-0 text-sm bg-[#5E60CE]/10 text-[#5E60CE] border-none px-3 py-1"
              >
                Atualizado
              </Badge>
            </div>
            
            {planItems?.pendingItems && planItems.pendingItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Próximos tópicos:</h4>
                <ul className="space-y-1">
                  {planItems.pendingItems.map((item) => (
                    <li key={item.id} className="text-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#5E60CE]"></span>
                      <span>{item.topico?.nome || 'Tópico'}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {item.tipo === 'video' ? 'Vídeo' : 'Exercício'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <EmptyState 
              message="Estamos analisando seu desempenho para criar um plano personalizado."
              icon={<TrendingUp className="h-5 w-5" />}
              className="bg-[#F6F6F7] mt-2"
            />
            <div className="text-center mt-4">
              <Badge className="text-sm px-3 py-1 bg-gray-100 text-gray-600">
                Em breve
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white rounded-md px-4 py-2"
          disabled={!hasStudyPlan}
          onClick={() => navigate('/plano')}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Ver Plano de Estudos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanCard;
