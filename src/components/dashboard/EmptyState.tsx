import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: React.ReactNode;
  onCtaClick?: () => void;
}

const EmptyState = ({ 
  message, 
  icon = <AlertCircle className="h-6 w-6" />, 
  className,
  ctaLabel,
  ctaHref,
  ctaIcon,
  onCtaClick
}: EmptyStateProps) => {
  return (
    <Alert variant="default" className={`bg-[#F6F6F7] border-dashed border-gray-200 ${className}`} data-testid="empty-state">
      <div className="flex flex-col items-center text-center py-6">
        <div className="text-gray-400 mb-3">
          {icon}
        </div>
        <AlertDescription className="text-gray-600 mb-4 text-base">
          {message}
        </AlertDescription>
        
        {ctaLabel && (ctaHref || onCtaClick) && (
          <div className="mt-2">
            {ctaHref ? (
              <Button 
                asChild 
                className="bg-coral hover:bg-coral/90 text-white rounded-xl px-6 py-3 h-auto font-medium text-sm"
                data-testid="empty-state-cta"
              >
                <Link to={ctaHref}>
                  {ctaIcon && <span className="mr-2">{ctaIcon}</span>}
                  {ctaLabel}
                </Link>
              </Button>
            ) : (
              <Button 
                onClick={onCtaClick}
                className="bg-coral hover:bg-coral/90 text-white rounded-xl px-6 py-3 h-auto font-medium text-sm"
                data-testid="empty-state-cta"
              >
                {ctaIcon && <span className="mr-2">{ctaIcon}</span>}
                {ctaLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
};

export default EmptyState;
