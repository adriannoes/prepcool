
import { useEffect, useRef } from 'react';

export const useScrollToElement = <T extends HTMLElement>(
  elementId: string | null, 
  dependencies: any[] = []
) => {
  const elementRef = useRef<T | null>(null);
  
  useEffect(() => {
    if (elementId && elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [elementId, ...dependencies]);
  
  return elementRef;
};
