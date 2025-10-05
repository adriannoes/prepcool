
import { toast as sonnerToast } from "sonner";

// Create a wrapper that mimics the original toast API but uses Sonner
export const toast = ({ title, description, variant }: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) => {
  if (variant === "destructive") {
    sonnerToast.error(title || "Erro", {
      description: description
    });
  } else {
    sonnerToast.success(title || "Sucesso", {
      description: description
    });
  }
};

export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [], // For backward compatibility
  };
};
