
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DiagnosticoFormValues {
  area_interesse: string;
  tipo_universidade: string;
  habilidades_para_melhorar: string[];
  experiencia_simulados: string;
  tempo_estudo_diario: string;
}

const areasInteresse = [
  { id: 'exatas', label: 'Exatas' },
  { id: 'humanas', label: 'Humanas' },
  { id: 'biologicas', label: 'Biológicas' },
  { id: 'linguagens', label: 'Linguagens' },
];

const habilidades = [
  { id: 'matematica', label: 'Matemática' },
  { id: 'redacao', label: 'Redação' },
  { id: 'fisica', label: 'Física' },
  { id: 'quimica', label: 'Química' },
  { id: 'historia', label: 'História' },
  { id: 'geografia', label: 'Geografia' },
  { id: 'biologia', label: 'Biologia' },
  { id: 'literatura', label: 'Literatura' },
  { id: 'ingles', label: 'Inglês' },
];

const Diagnostico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const form = useForm<DiagnosticoFormValues>({
    defaultValues: {
      area_interesse: '',
      tipo_universidade: '',
      habilidades_para_melhorar: [],
      experiencia_simulados: '',
      tempo_estudo_diario: ''
    },
  });

  useEffect(() => {
    const checkExistingDiagnostico = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('diagnostico')
          .select('*')
          .eq('usuario_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setHasCompletedBefore(true);
          // Pre-fill the form with existing data
          form.reset({
            area_interesse: data.respostas.area_interesse || '',
            tipo_universidade: data.respostas.tipo_universidade || '',
            habilidades_para_melhorar: data.respostas.habilidades_para_melhorar || [],
            experiencia_simulados: data.respostas.experiencia_simulados || '',
            tempo_estudo_diario: data.respostas.tempo_estudo_diario || '',
          });
        }
      } catch (error) {
        console.error('Error fetching diagnostico:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seu diagnóstico anterior.',
          variant: 'destructive',
        });
      }
    };

    checkExistingDiagnostico();
  }, [user, form, toast]);

  const onSubmit = async (values: DiagnosticoFormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para enviar o diagnóstico.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('diagnostico')
        .upsert({
          usuario_id: user.id,
          respostas: values,
        });

      if (error) throw error;

      setIsSuccessDialogOpen(true);
      
      // In a real implementation, we would send the diagnostico to a webhook here
      // For now, we'll just wait a moment and then redirect to dashboard
      setTimeout(() => {
        setIsSuccessDialogOpen(false);
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error submitting diagnostico:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar seu diagnóstico. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <DashboardBreadcrumb 
        currentPage="Diagnóstico Inicial"
        paths={[{ name: 'Dashboard', path: '/dashboard' }]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Diagnóstico Inicial</h1>
        <p className="text-gray-600 mt-2">
          Responda às perguntas para que possamos personalizar seu plano de estudos.
          {hasCompletedBefore && " Você já completou este diagnóstico, mas pode atualizá-lo."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seu Perfil de Estudos</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="area_interesse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual área mais lhe interessa?</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        {areasInteresse.map((area) => (
                          <FormItem key={area.id} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={area.id} />
                            </FormControl>
                            <FormLabel className="font-normal">{area.label}</FormLabel>
                          </FormItem>
                        ))}
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
                    <FormLabel>Qual tipo de universidade você pretende ingressar?</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="publica">Universidade Pública</SelectItem>
                        <SelectItem value="privada">Universidade Privada</SelectItem>
                        <SelectItem value="ambas">Ambas</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormLabel className="text-base">Quais habilidades você gostaria de melhorar?</FormLabel>
                      <FormDescription>
                        Selecione todas as áreas em que você sente que precisa melhorar.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {habilidades.map((habilidade) => (
                        <FormField
                          key={habilidade.id}
                          control={form.control}
                          name="habilidades_para_melhorar"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={habilidade.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(habilidade.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, habilidade.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== habilidade.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {habilidade.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nunca_fiz">Nunca fiz um simulado</SelectItem>
                        <SelectItem value="alguns">Já fiz alguns simulados</SelectItem>
                        <SelectItem value="varios">Faço simulados regularmente</SelectItem>
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
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="menos_1h">Menos de 1 hora</SelectItem>
                        <SelectItem value="1_3h">Entre 1 e 3 horas</SelectItem>
                        <SelectItem value="3_5h">Entre 3 e 5 horas</SelectItem>
                        <SelectItem value="mais_5h">Mais de 5 horas</SelectItem>
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
            className="bg-[#5E60CE] hover:bg-[#5E60CE]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Diagnóstico'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Diagnóstico Concluído!</h3>
            <p className="text-gray-600">
              Seu diagnóstico foi recebido com sucesso. Estamos gerando seu plano de estudos personalizado.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diagnostico;
