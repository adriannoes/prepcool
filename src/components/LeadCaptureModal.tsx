
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

// Brazilian phone validator
const phoneRegex = /^\(?(?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])\)? ?(?:[2-8]|9[0-9])[0-9]{3}-?[0-9]{4}$/;

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  phone: z.string().regex(phoneRegex, { message: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX" }),
  email: z.string().email({ message: "E-mail inválido" })
});

type FormValues = z.infer<typeof formSchema>;

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Simulate API call
    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form data submitted:', data);
      toast.success('Obrigado por se inscrever! Entraremos em contato em breve.');
      form.reset();
      onClose();
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar o formulário. Tente novamente.');
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center mt-4">
              <Button 
                type="submit"
                className="bg-coral hover:bg-coral/90 text-white font-semibold px-10 py-3 rounded-lg shadow-lg transition-all text-lg w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Entrar na Lista de Espera'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
