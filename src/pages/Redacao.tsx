
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ModeloRedacao {
  id: string;
  instituicao: string;
  tema: string;
  exemplo: string;
}

const Redacao = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [modeloRedacao, setModeloRedacao] = useState<ModeloRedacao | null>(null);
  const [modelos, setModelos] = useState<ModeloRedacao[]>([]);
  const [studentEssay, setStudentEssay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);

  // Fetch available model essays
  useEffect(() => {
    const fetchModeloRedacoes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('modelo_redacao')
          .select('*');

        if (error) throw error;
        setModelos(data || []);
      } catch (error) {
        console.error('Error fetching modelo redacoes:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os modelos de redação.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModeloRedacoes();
  }, []);

  // Handle institution selection
  const handleInstitutionChange = (value: string) => {
    setSelectedInstitution(value);
    
    // Find the selected model essay
    const selectedModelo = modelos.find(modelo => modelo.instituicao === value);
    setModeloRedacao(selectedModelo || null);
  };

  // Handle essay submission
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para enviar uma redação.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedInstitution) {
      toast({
        title: 'Erro',
        description: 'Selecione uma instituição ou tópico antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    if (!studentEssay.trim()) {
      toast({
        title: 'Erro',
        description: 'Escreva sua redação antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setIsProcessingDialogOpen(true);
    
    try {
      // Insert the essay into the database
      const { data, error } = await supabase
        .from('redacao')
        .insert({
          usuario_id: user.id,
          tema: modeloRedacao?.tema || selectedInstitution,
          texto: studentEssay,
        })
        .select('id')
        .single();

      if (error) throw error;

      // In a real implementation, we would send the essay to the webhook here
      // For now, we'll simulate this with a timeout
      
      // Mock webhook call - in the real implementation, this would be:
      // const response = await fetch('/webhook/redacao', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     usuario_id: user.id,
      //     instituicao: selectedInstitution,
      //     tema: modeloRedacao?.tema,
      //     texto: studentEssay,
      //     redacao_id: data.id
      //   }),
      // });

      // Simulate processing time (15 seconds)
      setTimeout(async () => {
        // Simulate a mock feedback response
        const mockFeedback = "Sua redação apresenta bons argumentos, mas poderia melhorar na estrutura dos parágrafos e na conclusão.";
        const mockNota = Math.floor(Math.random() * 3) + 7; // Random score between 7 and 9
        
        // Update the essay with the feedback
        await supabase
          .from('redacao')
          .update({
            feedback: mockFeedback,
            nota: mockNota
          })
          .eq('id', data.id);

        setIsProcessingDialogOpen(false);
        navigate(`/redacao/feedback?id=${data.id}`);
      }, 15000);
      
    } catch (error) {
      console.error('Error submitting essay:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar sua redação. Tente novamente.',
        variant: 'destructive',
      });
      setIsProcessingDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Redação"
        paths={[{ name: 'Dashboard', path: '/dashboard' }]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Escrever Redação</h1>
        <p className="text-gray-600 mt-2">
          Escolha uma instituição ou tópico, veja o modelo e escreva sua redação.
        </p>
      </div>

      <div className="space-y-8">
        {/* Select institution/topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a instituição ou tópico
          </label>
          <Select onValueChange={handleInstitutionChange} value={selectedInstitution}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5E60CE]" />
                </div>
              ) : (
                modelos.map(modelo => (
                  <SelectItem key={modelo.id} value={modelo.instituicao}>
                    {modelo.instituicao} - {modelo.tema}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Model essay display */}
        {modeloRedacao && (
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="mb-4">
              <h3 className="text-lg font-bold">Modelo de Redação - {modeloRedacao.instituicao}</h3>
              <p className="text-sm font-medium text-gray-500">Tema: {modeloRedacao.tema}</p>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {modeloRedacao.exemplo}
              </p>
            </div>
          </div>
        )}

        {/* Student essay textarea */}
        <div>
          <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
            Escreva sua redação
          </label>
          <Textarea
            id="essay"
            value={studentEssay}
            onChange={(e) => setStudentEssay(e.target.value)}
            placeholder="Comece a escrever sua redação aqui..."
            className="min-h-[300px] text-base"
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedInstitution || !studentEssay.trim()}
            className="bg-[#5E60CE] hover:bg-[#5E60CE]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Redação
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Processing Dialog */}
      <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
        <DialogContent className="sm:max-w-md" hideClose={true}>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#5E60CE] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Processando sua redação</h3>
            <p className="text-gray-600">
              Nosso sistema está avaliando seu texto. Isso pode levar até 15 segundos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Redacao;
