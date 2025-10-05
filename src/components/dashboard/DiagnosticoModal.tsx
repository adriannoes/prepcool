
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

const skillOptions = [
  { id: 'mathematics', label: 'Matemática' },
  { id: 'essay', label: 'Redação' },
  { id: 'reading', label: 'Interpretação de texto' },
  { id: 'sciences', label: 'Ciências naturais' },
  { id: 'current-events', label: 'Atualidades' },
  { id: 'all', label: 'Todas' }
];

interface DiagnosticoFormData {
  area_interesse: string;
  tipo_universidade: string;
  habilidades_para_melhorar: string[];
  experiencia_simulados: string;
}

interface DiagnosticoModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export default function DiagnosticoModal({ isOpen, onComplete }: DiagnosticoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const form = useForm<DiagnosticoFormData>({
    defaultValues: {
      area_interesse: '',
      tipo_universidade: '',
      habilidades_para_melhorar: [],
      experiencia_simulados: '',
    },
  });

  const onSubmit = async (data: DiagnosticoFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Save to Supabase diagnostico table
      const { error: diagnosticoError } = await supabase
        .from('diagnostico')
        .insert({
          usuario_id: user.id,
          respostas: data as unknown as Json
        });

      if (diagnosticoError) throw diagnosticoError;

      // Step 2: Update usuario table to mark diagnostico as completed
      const { error: usuarioError } = await supabase
        .from('usuario')
        .update({ diagnostico_preenchido: true })
        .eq('id', user.id);

      if (usuarioError) throw usuarioError;

      // Step 3: Send to webhook
      try {
        const webhookResponse = await fetch('/webhook/diagnostico', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuario_id: user.id,
            ...data
          }),
        });

        if (!webhookResponse.ok) {
          console.warn('Webhook failed, but diagnostic was saved successfully');
        }
      } catch (webhookError) {
        console.warn('Webhook error:', webhookError);
      }

      toast({
        title: "Diagnóstico concluído!",
        description: "Seu plano de estudos personalizado está sendo gerado!",
      });

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Redirect to dashboard if no callback provided (fallback behavior)
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      toast({
        title: "Erro",
        description: "Houve um problema ao enviar seu diagnóstico. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allSkills = skillOptions.filter(option => option.id !== 'all').map(option => option.id);
      form.setValue('habilidades_para_melhorar', allSkills);
    } else {
      form.setValue('habilidades_para_melhorar', []);
    }
  };

  const isAllSelected = () => {
    const selectedSkills = form.watch('habilidades_para_melhorar');
    const skillsWithoutAll = skillOptions.filter(option => option.id !== 'all').map(option => option.id);
    return skillsWithoutAll.every(skill => selectedSkills.includes(skill));
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Bem-vindo à PrepCool!
          </DialogTitle>
          <p className="text-center text-gray-600 text-base leading-relaxed">
            Complete este diagnóstico rápido para que possamos personalizar seu plano de estudos.
          </p>
        </DialogHeader>
        
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Area of Interest */}
              <FormField
                control={form.control}
                name="area_interesse"
                rules={{ required: "Por favor, selecione uma área de interesse" }}
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-semibold text-gray-900">
                      Em qual área você pretende focar?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Humanas" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Humanas
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Exatas" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Exatas
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Biológicas" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Biológicas
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Não tenho certeza" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Não tenho certeza
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* University Type */}
              <FormField
                control={form.control}
                name="tipo_universidade"
                rules={{ required: "Por favor, selecione um tipo de universidade" }}
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-semibold text-gray-900">
                      Que tipo de universidade você pretende cursar?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Pública" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Pública
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Privada" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Privada
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Não tenho certeza" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Não tenho certeza
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills to Improve */}
              <FormField
                control={form.control}
                name="habilidades_para_melhorar"
                rules={{ required: "Por favor, selecione pelo menos uma habilidade" }}
                render={() => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-semibold text-gray-900">
                      Quais habilidades você gostaria de melhorar?
                    </FormLabel>
                    
                    <div className="space-y-3">
                      {/* "All" checkbox */}
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Checkbox 
                          id="all" 
                          checked={isAllSelected()} 
                          onCheckedChange={handleSelectAll} 
                        />
                        <label
                          htmlFor="all"
                          className="font-medium text-gray-700 cursor-pointer flex-1"
                        >
                          Todas
                        </label>
                      </div>
                      
                      {skillOptions.filter(option => option.id !== 'all').map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="habilidades_para_melhorar"
                          render={({ field }) => {
                            return (
                              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                                  {item.label}
                                </FormLabel>
                              </div>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience with Mock Exams */}
              <FormField
                control={form.control}
                name="experiencia_simulados"
                rules={{ required: "Por favor, selecione seu nível de experiência" }}
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-semibold text-gray-900">
                      Como você se sente em relação aos simulados?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Nunca fiz" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Nunca fiz
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Tentei mas tenho dificuldade" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Tentei mas tenho dificuldade
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <FormControl>
                            <RadioGroupItem value="Pratico regularmente" />
                          </FormControl>
                          <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                            Pratico regularmente
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white font-semibold text-base rounded-xl transition-all duration-200" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Finalizar Diagnóstico"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
