
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define the form schema using Zod
const formSchema = z.object({
  area_interesse: z.string(),
  tipo_universidade: z.string(),
  habilidades_para_melhorar: z.array(z.string()).min(1, { message: "Selecione pelo menos uma habilidade" }),
  experiencia_simulados: z.string(),
  tempo_estudo_diario: z.string(),
});

// Define the type based on the schema
type DiagnosticoFormValues = z.infer<typeof formSchema>;

const Diagnostico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDiagnostico, setExistingDiagnostico] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the form
  const form = useForm<DiagnosticoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area_interesse: '',
      tipo_universidade: '',
      habilidades_para_melhorar: [],
      experiencia_simulados: '',
      tempo_estudo_diario: '',
    },
  });

  // Check if user already has a diagnostico
  useEffect(() => {
    const checkDiagnostico = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('diagnostico')
          .select('*')
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setExistingDiagnostico(data);
          
          // Populate form with existing data if available
          const respostas = data.respostas as any;
          form.reset({
            area_interesse: respostas.area_interesse || '',
            tipo_universidade: respostas.tipo_universidade || '',
            habilidades_para_melhorar: respostas.habilidades_para_melhorar || [],
            experiencia_simulados: respostas.experiencia_simulados || '',
            tempo_estudo_diario: respostas.tempo_estudo_diario || '',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar diagnóstico: ' + error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkDiagnostico();
  }, [user]);

  const onSubmit = async (values: DiagnosticoFormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para realizar o diagnóstico.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert or update diagnostico
      const { error } = await supabase
        .from('diagnostico')
        .upsert({
          usuario_id: user.id,
          respostas: values as any,
        })
        .select();

      if (error) throw error;

      toast({
        title: existingDiagnostico ? 'Diagnóstico atualizado' : 'Diagnóstico concluído',
        description: existingDiagnostico 
          ? 'Seu diagnóstico foi atualizado com sucesso.' 
          : 'Seu diagnóstico foi registrado com sucesso!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar diagnóstico: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Diagnóstico de Aprendizado</CardTitle>
          <CardDescription>
            {existingDiagnostico 
              ? 'Atualize suas informações de diagnóstico para personalizar melhor seu plano de estudos.' 
              : 'Responda às perguntas abaixo para criarmos um plano de estudos personalizado para você.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="area_interesse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual área mais te interessa?</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Exatas" id="exatas" />
                          <Label htmlFor="exatas">Exatas</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Humanas" id="humanas" />
                          <Label htmlFor="humanas">Humanas</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Biológicas" id="biologicas" />
                          <Label htmlFor="biologicas">Biológicas</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_universidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Que tipo de universidade você pretende ingressar?</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Pública" id="publica" />
                          <Label htmlFor="publica">Pública</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Particular" id="particular" />
                          <Label htmlFor="particular">Particular</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Ambas" id="ambas" />
                          <Label htmlFor="ambas">Ambas</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="habilidades_para_melhorar"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Quais habilidades você gostaria de melhorar?</FormLabel>
                    </div>
                    {["Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Literatura", "Redação", "Língua Estrangeira"].map((habilidade) => (
                      <FormField
                        key={habilidade}
                        control={form.control}
                        name="habilidades_para_melhorar"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={habilidade}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(habilidade)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, habilidade])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== habilidade
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {habilidade}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experiencia_simulados"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual sua experiência com simulados?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nunca fiz">Nunca fiz</SelectItem>
                        <SelectItem value="Fiz alguns">Fiz alguns</SelectItem>
                        <SelectItem value="Faço regularmente">Faço regularmente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempo_estudo_diario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quanto tempo você dedica aos estudos diariamente?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Menos de 1 hora">Menos de 1 hora</SelectItem>
                        <SelectItem value="1-2 horas">1-2 horas</SelectItem>
                        <SelectItem value="3-4 horas">3-4 horas</SelectItem>
                        <SelectItem value="Mais de 4 horas">Mais de 4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="bg-coral hover:bg-coral/90 w-full sm:w-auto"
          >
            {isSubmitting 
              ? 'Salvando...' 
              : existingDiagnostico 
                ? 'Atualizar Diagnóstico' 
                : 'Finalizar Diagnóstico'
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Diagnostico;
