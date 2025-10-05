
// Input validation utilities for security
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNotificationMessage = (message: string): string | null => {
  if (!message || message.trim().length === 0) {
    return 'A mensagem é obrigatória.';
  }
  
  if (message.length > 500) {
    return 'A mensagem deve ter no máximo 500 caracteres.';
  }
  
  // Check for potentially malicious content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return 'A mensagem contém conteúdo não permitido.';
    }
  }
  
  return null;
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true; // URL is optional
  
  try {
    // Only allow relative URLs or URLs from same origin for security
    if (url.startsWith('/')) {
      return true;
    }
    
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};
