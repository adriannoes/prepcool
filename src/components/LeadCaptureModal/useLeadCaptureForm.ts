import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { formSchema, FormValues } from './types';
import { validateWebhookUrl } from '@/utils/webhookValidation';
import { error as logError } from '@/utils/logger';

const PIPEFY_WEBHOOK_URL = import.meta.env.VITE_PIPEFY_WEBHOOK_URL;

// Validate webhook URL at module load time
const webhookValidation = validateWebhookUrl(PIPEFY_WEBHOOK_URL);
if (!webhookValidation.isValid) {
  throw new Error(
    `Invalid webhook URL configuration: ${webhookValidation.error}. Please check your .env file and ensure VITE_PIPEFY_WEBHOOK_URL is set to a valid HTTPS URL.`
  );
}

const useLeadCaptureForm = (onClose: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      objetivos: ''
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    try {
      // Validate webhook URL before making request
      const validation = validateWebhookUrl(PIPEFY_WEBHOOK_URL);
      if (!validation.isValid) {
        // Provide user-friendly error message
        const userMessage = !PIPEFY_WEBHOOK_URL
          ? 'Serviço de inscrição não configurado. Por favor, entre em contato com o suporte.'
          : 'Configuração do serviço de inscrição inválida. Por favor, entre em contato com o suporte.';
        throw new Error(userMessage);
      }

      const phoneNumbers = data.phone.replace(/\D/g, '');
      const response = await fetch(PIPEFY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: phoneNumbers,
          email: data.email,
          objetivos: data.objetivos || ''
        }),
      });
      if (response.ok) {
        setSubmissionStatus('success');
        toast.success('Inscrição realizada com sucesso!');
        form.reset();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmissionStatus('error');
        toast.error('Tivemos um problema. Por favor, tente novamente.');
        logError('Form submission error:', { status: response.status, statusText: response.statusText });
      }
    } catch (error) {
      setSubmissionStatus('error');
      
      // Provide user-friendly error messages
      let errorMessage = 'Tivemos um problema. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('não configurado') || error.message.includes('Configuração')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid webhook URL')) {
          errorMessage = 'Serviço de inscrição temporariamente indisponível. Por favor, tente novamente mais tarde ou entre em contato com o suporte.';
        } else {
          errorMessage = error.message || 'Tivemos um problema. Por favor, tente novamente.';
        }
      }
      
      toast.error(errorMessage);
      logError('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    cleaned = cleaned.substring(0, 11);
    if (cleaned.length <= 10) {
      if (cleaned.length > 6) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
      } else if (cleaned.length > 2) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      } else if (cleaned.length > 0) {
        return `(${cleaned}`;
      }
    } else {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    return value;
  };

  const handleRetry = () => {
    setSubmissionStatus('idle');
  };

  const objetivosValue = form.watch('objetivos') || '';
  const remainingChars = 300 - objetivosValue.length;

  return {
    form,
    isSubmitting,
    submissionStatus,
    onSubmit,
    formatPhoneNumber,
    handleRetry,
    remainingChars,
  };
};

export default useLeadCaptureForm; 