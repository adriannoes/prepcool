import * as z from 'zod';

export const formSchema = z.object({
  assunto: z.string().min(1, 'Por favor, selecione um assunto'),
  mensagem: z.string()
    .min(10, 'A mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'A mensagem deve ter no máximo 1000 caracteres')
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      'Conteúdo não permitido na mensagem'
    ),
});

export type FormData = z.infer<typeof formSchema>;

export type HelpDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children?: React.ReactNode;
}; 