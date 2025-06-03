import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import useLeadCaptureForm from './useLeadCaptureForm';
import type { LeadCaptureModalProps } from './types';

const LeadCaptureDialog: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose }) => {
  const {
    form,
    isSubmitting,
    submissionStatus,
    onSubmit,
    formatPhoneNumber,
    handleRetry,
    remainingChars,
  } = useLeadCaptureForm(onClose);

  const objetivosValue = form.watch('objetivos') || '';

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

              <FormField
                control={form.control}
                name="objetivos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Quais objetivos você quer alcançar com a nossa plataforma?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Quero passar no vestibular da UFPR estudando por conta própria" 
                        className="border-gray-300 focus:ring-coral focus:border-coral min-h-[80px] max-h-[120px] resize-none"
                        maxLength={300}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {remainingChars} caracteres restantes
                    </div>
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

export default LeadCaptureDialog; 