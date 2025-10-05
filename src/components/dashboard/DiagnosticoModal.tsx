
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

const skillOptions = [
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'essay', label: 'Essay writing' },
  { id: 'reading', label: 'Reading comprehension' },
  { id: 'sciences', label: 'Natural sciences' },
  { id: 'current-events', label: 'Current events' },
  { id: 'all', label: 'All' }
];

interface DiagnosticoFormData {
  area_interesse: string;
  tipo_universidade: string;
  habilidades_para_melhorar: string[];
  experiencia_simulados: string;
}

interface DiagnosticoModalProps {
  isOpen: boolean;
}

export default function DiagnosticoModal({ isOpen }: DiagnosticoModalProps) {
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
      const { error } = await supabase
        .from('diagnostico')
        .insert({
          usuario_id: user.id,
          respostas: data
        });

      if (error) throw error;

      // Step 2: Send to webhook
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
        throw new Error('Failed to process webhook');
      }

      toast({
        title: "Success!",
        description: "Your personalized study plan is being generated!",
      });

      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your diagnostic. Please try again.",
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
      <DialogContent className="sm:max-w-md md:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to PrepCool!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-600 mb-6">
            Please complete this short diagnostic to help us customize your study plan.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Area of Interest */}
              <FormField
                control={form.control}
                name="area_interesse"
                rules={{ required: "Please select an area of interest" }}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">What area do you intend to focus on?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Humanas" />
                          </FormControl>
                          <FormLabel className="font-normal">Humanas</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Exatas" />
                          </FormControl>
                          <FormLabel className="font-normal">Exatas</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Biológicas" />
                          </FormControl>
                          <FormLabel className="font-normal">Biológicas</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Not sure" />
                          </FormControl>
                          <FormLabel className="font-normal">Not sure</FormLabel>
                        </FormItem>
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
                rules={{ required: "Please select a university type" }}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">What type of university do you plan to attend?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Pública" />
                          </FormControl>
                          <FormLabel className="font-normal">Public</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Privada" />
                          </FormControl>
                          <FormLabel className="font-normal">Private</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Not sure" />
                          </FormControl>
                          <FormLabel className="font-normal">Not sure</FormLabel>
                        </FormItem>
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
                rules={{ required: "Please select at least one skill" }}
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base font-medium">Which skills do you want to improve?</FormLabel>
                    </div>
                    
                    {/* "All" checkbox */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox 
                        id="all" 
                        checked={isAllSelected()} 
                        onCheckedChange={handleSelectAll} 
                      />
                      <label
                        htmlFor="all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        All
                      </label>
                    </div>
                    
                    {skillOptions.filter(option => option.id !== 'all').map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="habilidades_para_melhorar"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-1"
                            >
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
                              <FormLabel className="font-normal text-sm">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience with Mock Exams */}
              <FormField
                control={form.control}
                name="experiencia_simulados"
                rules={{ required: "Please select your experience level" }}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">How do you feel about mock exams?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Nunca fiz" />
                          </FormControl>
                          <FormLabel className="font-normal">Never taken one</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Tentei mas tenho dificuldade" />
                          </FormControl>
                          <FormLabel className="font-normal">Tried but struggle</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Pratico regularmente" />
                          </FormControl>
                          <FormLabel className="font-normal">Regularly practice</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
