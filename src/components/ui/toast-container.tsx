
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number; // in milliseconds
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right',
  autoClose = 5000
}) => {
  const { toasts, dismiss } = useToast();

  // Auto-dismiss toasts
  useEffect(() => {
    if (autoClose <= 0) return;

    const timers = toasts.map(toast => {
      if (toast.open) {
        return setTimeout(() => {
          dismiss(toast.id);
        }, autoClose);
      }
      return undefined;
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [toasts, dismiss, autoClose]);

  if (toasts.length === 0) {
    return null;
  }

  const variants = {
    initial: { 
      opacity: 0, 
      y: position.startsWith('top') ? -20 : 20,
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div
      className={`fixed z-50 w-full sm:max-w-sm ${positionClasses[position]}`}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map(toast => (
          toast.open && (
            <motion.div
              key={toast.id}
              layout
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              role="status"
              aria-atomic="true"
              className={`mb-3 overflow-hidden rounded-lg shadow-lg ${
                toast.variant === 'destructive' 
                  ? 'bg-red-50 border-l-4 border-red-500' 
                  : 'bg-white border-l-4 border-coral'
              }`}
            >
              <div className="flex p-4">
                <div className="flex-1">
                  {toast.title && (
                    <p className={`text-sm font-medium ${
                      toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
                    }`}>
                      {toast.title}
                    </p>
                  )}
                  {toast.description && (
                    <p className={`mt-1 text-sm ${
                      toast.variant === 'destructive' ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      {toast.description}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => dismiss(toast.id)} 
                  className={`ml-4 flex-shrink-0 rounded-full p-1 hover:bg-gray-200 ${
                    toast.variant === 'destructive' ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  <X size={16} />
                  <span className="sr-only">Fechar</span>
                </button>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
