import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formSchema, FormData } from './types';

const useHelpForm = (setIsOpen: (open: boolean) => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assunto: '',
      mensagem: '',
    },
  });

  const submitHelpRequest = async (data: FormData) => {
    try {
      const now = Date.now();
      if (now - lastSubmission < 60000) {
        toast({
          title: 'Muitas solicitações',
          description: 'Por favor, aguarde 1 minuto antes de enviar outra solicitação.',
          variant: 'destructive',
        });
        return;
      }
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');
      const { data: result, error } = await supabase.functions.invoke('help-request', {
        body: {
          assunto: data.assunto,
          mensagem: data.mensagem,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) throw error;
      if (!result.success) throw new Error(result.message || 'Erro ao enviar solicitação');
      toast({
        title: 'Solicitação enviada com sucesso!',
        description: 'Sua solicitação foi enviada com sucesso! Responderemos em breve.',
      });
      form.reset();
      setIsOpen(false);
      setLastSubmission(now);
    } catch (error) {
      toast({
        title: 'Erro ao enviar solicitação',
        description: 'Erro ao enviar a solicitação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para enviar uma solicitação.',
        variant: 'destructive',
      });
      return;
    }
    submitHelpRequest(data);
  };

  return { form, isSubmitting, onSubmit };
};

export default useHelpForm; 