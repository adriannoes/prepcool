import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { formSchema, FormValues } from './types';

const PIPEFY_WEBHOOK_URL = 'https://ipaas.pipefy.com/api/v1/webhooks/5OGl3Tq0S97bvsfpG4X0b/sync';

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
        console.error('Form submission error:', response.status, response.statusText);
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast.error('Tivemos um problema. Por favor, tente novamente.');
      console.error('Form submission error:', error);
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