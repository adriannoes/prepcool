
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EssayTextarea } from '@/components/ui/essay-textarea';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModeloRedacao {
  id: string;
  instituicao: string;
  tema: string;
  exemplo: string;
}

interface WebhookResponse {
  nota: number;
  tema: string;
  pontos_fortes: string[];
  melhorias: string[];
  comentario_final: string;
}

const WEBHOOK_URL = 'https://nocode-n8n.yepnl6.easypanel.host/webhook-test/correcao-de-redacoes-215j3hb5hj34b4';

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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);
    
    // Find the selected model essay
    const selectedModelo = modelos.find(modelo => modelo.instituicao === value);
    setModeloRedacao(selectedModelo || null);
  };

  // Submit essay to webhook
  const submitToWebhook = async (payload: any): Promise<WebhookResponse> => {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return await response.json();
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

    if (studentEssay.length < 100) {
      toast({
        title: 'Redação muito curta',
        description: 'Sua redação deve ter pelo menos 100 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setIsProcessingDialogOpen(true);
    setSubmitError(null);
    
    try {
      const payload = {
        usuario_id: user.id,
        tema: modeloRedacao?.tema || selectedInstitution,
        redacao: studentEssay,
      };

      console.log('Submitting to webhook:', payload);
      
      // Submit to webhook with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );
      
      const webhookResponse = await Promise.race([
        submitToWebhook(payload),
        timeoutPromise
      ]) as WebhookResponse;

      console.log('Webhook response:', webhookResponse);

      // Store response for feedback page
      localStorage.setItem('essay_feedback', JSON.stringify({
        ...webhookResponse,
        redacao: studentEssay,
        created_at: new Date().toISOString()
      }));

      toast({
        title: 'Redação avaliada!',
        description: 'Sua redação foi corrigida com sucesso.',
      });

      setIsProcessingDialogOpen(false);
      navigate('/redacao/feedback');
      
    } catch (error) {
      console.error('Error submitting essay:', error);
      setIsProcessingDialogOpen(false);
      
      const errorMessage = error instanceof Error && error.message === 'Timeout' 
        ? 'A correção está demorando mais que o esperado. Tente novamente.'
        : 'Tivemos um erro. Tente novamente.';
      
      setSubmitError(errorMessage);
      
      toast({
        title: 'Falha na correção',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Redação"
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Escrever Redação</h1>
        <p className="text-gray-600 mt-2">
          Escolha uma instituição ou tópico, veja o modelo e escreva sua redação seguindo os padrões ENEM.
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
                  <Loader2 className="h-6 w-6 animate-spin text-coral" />
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
        {isLoading ? (
          <div className="border rounded-md p-4 bg-gray-50 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : modeloRedacao ? (
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
        ) : null}

        {/* Error alert */}
        {submitError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* Student essay textarea with ENEM limitations */}
        <div>
          <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
            Escreva sua redação (Padrão ENEM)
          </label>
          <EssayTextarea
            value={studentEssay}
            onChange={setStudentEssay}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedInstitution || !studentEssay.trim() || studentEssay.length < 100}
            className="bg-coral hover:bg-coral/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar para Correção
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Processing Dialog */}
      <Dialog open={isProcessingDialogOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-coral mb-4" />
            <h3 className="text-xl font-semibold mb-2">Processando sua redação</h3>
            <p className="text-gray-600">
              Nossa IA está avaliando seu texto. Isso pode levar até 30 segundos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Redacao;
