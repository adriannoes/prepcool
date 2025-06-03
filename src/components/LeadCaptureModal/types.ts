import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
    .refine((value) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.length >= 10 && numbers.length <= 11;
    }, { message: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX" }),
  email: z.string().email({ message: "E-mail inválido" }),
  objetivos: z.string().max(300, { message: "Máximo de 300 caracteres" }).optional()
});

export type FormValues = z.infer<typeof formSchema>;

export interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
} 