import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Validador de telefone brasileiro mais flexível
// Aceita formatos: (XX) XXXXX-XXXX, (XX)XXXXX-XXXX, XXXXXXXXXXX, etc.
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
    .refine((value) => {
      // Remove todos os caracteres não-numéricos
      const numbers = value.replace(/\D/g, '');
      // Verifica se tem entre 10 e 11 dígitos (números fixos e celulares no Brasil)
      return numbers.length >= 10 && numbers.length <= 11;
    }, { message: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX" }),
  email: z.string().email({ message: "E-mail inválido" })
});

type FormValues = z.infer<typeof formSchema>;

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIPEFY_WEBHOOK_URL = 'https://ipaas.pipefy.com/api/v1/webhooks/5OGl3Tq0S97bvsfpG4X0b/sync';

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: ''
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    
    try {
      // Formata o telefone para enviar apenas os números
      const phoneNumbers = data.phone.replace(/\D/g, '');
      
      // Send data to Pipefy webhook
      const response = await fetch(PIPEFY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: phoneNumbers, // Envia apenas os números do telefone
          email: data.email
        }),
      });
      
      // Check if response is successful (status code 200-299)
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
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Limit to max 11 digits
    cleaned = cleaned.substring(0, 11);
    
    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (cleaned.length <= 10) {
      if (cleaned.length > 6) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
      } else if (cleaned.length > 2) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      } else if (cleaned.length > 0) {
        return `(${cleaned}`;
      }
    } else {
      // For 11 digits (with 9 prefix for mobile phones)
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    
    return value;
  };
  
  const handleRetry = () => {
    setSubmissionStatus('idle');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Entre para nossa <span className="text-coral">lista de espera</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Preencha o formulário abaixo para ser um dos primeiros a experimentar nossa plataforma.
          </DialogDescription>
        </DialogHeader>

        {submissionStatus === 'success' ? (
          <div className="py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Inscrição realizada com sucesso!</h3>
            <p className="text-gray-600">Entraremos em contato em breve!</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nome completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo" 
                        className="border-gray-300 focus:ring-coral focus:border-coral"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(XX) XXXXX-XXXX" 
                        className="border-gray-300 focus:ring-coral focus:border-coral"
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          e.target.value = formatted;
                          onChange(e);
                        }}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">E-mail</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        type="email"
                        className="border-gray-300 focus:ring-coral focus:border-coral"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center mt-4">
                {submissionStatus === 'error' ? (
                  <div className="space-y-4 w-full">
                    <div className="bg-red-50 p-4 rounded-md text-center">
                      <p className="text-red-700">Tivemos um problema. Por favor, tente novamente.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="submit"
                        className="bg-coral hover:bg-coral/90 text-white font-semibold px-10 py-3 rounded-lg shadow-lg transition-all text-lg w-full"
                        disabled={isSubmitting}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="submit"
                    className="bg-coral hover:bg-coral/90 text-white font-semibold px-10 py-3 rounded-lg shadow-lg transition-all text-lg w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Enviando...
                      </>
                    ) : (
                      'Entrar na Lista de Espera'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
