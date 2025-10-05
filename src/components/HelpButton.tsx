
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  assunto: z.string().min(1, 'Por favor, selecione um assunto'),
  mensagem: z.string().min(1, 'Por favor, digite sua mensagem').max(500, 'A mensagem deve ter no máximo 500 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assunto: '',
      mensagem: '',
    },
  });

  const subjectOptions = [
    { value: 'Problemas técnicos', label: 'Problemas técnicos' },
    { value: 'Dúvida sobre o plano de estudos', label: 'Dúvida sobre o plano de estudos' },
    { value: 'Ajuda com redação', label: 'Ajuda com redação' },
    { value: 'Feedback sobre o produto', label: 'Feedback sobre o produto' },
    { value: 'Outros', label: 'Outros' },
  ];

  const submitHelpRequest = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        usuario_id: user?.id,
        nome: user?.user_metadata?.nome || 'Usuário não identificado',
        email: user?.email,
        assunto: data.assunto,
        mensagem: data.mensagem,
        origem: 'dashboard',
      };

      console.log('Sending help request:', payload);

      const response = await fetch('https://ipaas.pipefy.com/api/v1/webhooks/maeVD2oy3OKLjIqpVDj9h/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Sua solicitação foi enviada com sucesso! Responderemos em breve.",
      });

      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Erro ao enviar a solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: FormData) => {
    submitHelpRequest(data);
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-12 w-12 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-[#5E60CE] hover:shadow-sm group"
              >
                <HelpCircle className="h-5 w-5 text-[#5E60CE] group-hover:text-coral transition-colors duration-200" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Precisa de ajuda?</p>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Como podemos ajudar?
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="assunto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Assunto
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mensagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Mensagem
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva sua dúvida ou problema..."
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-gray-500">
                        {field.value.length}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-coral hover:bg-coral/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar pedido de ajuda'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default HelpButton;
