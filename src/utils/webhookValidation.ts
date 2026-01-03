/**
 * Validates webhook URL format and security requirements
 * 
 * @param url - The webhook URL to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a webhook URL is properly formatted and secure
 * 
 * Requirements:
 * - Must be a valid URL format
 * - Must use HTTPS protocol (not HTTP) for security
 * - Must be a complete URL with protocol, domain, and path
 * 
 * @param url - The webhook URL string to validate
 * @returns Validation result with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateWebhookUrl('https://api.example.com/webhook');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateWebhookUrl(url: string | undefined | null): WebhookValidationResult {
  // Check if URL is provided
  if (!url) {
    return {
      isValid: false,
      error: 'Webhook URL is required but was not provided',
    };
  }

  // Check if URL is a non-empty string
  if (typeof url !== 'string' || url.trim().length === 0) {
    return {
      isValid: false,
      error: 'Webhook URL must be a non-empty string',
    };
  }

  let parsedUrl: URL;
  
  try {
    // Attempt to parse the URL
    parsedUrl = new URL(url.trim());
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format. Webhook URL must be a valid URL (e.g., https://example.com/webhook)',
    };
  }

  // Enforce HTTPS for security
  if (parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      error: 'Webhook URL must use HTTPS protocol for security. HTTP is not allowed.',
    };
  }

  // Ensure URL has a hostname
  if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
    return {
      isValid: false,
      error: 'Webhook URL must include a valid hostname',
    };
  }

  // Additional security: reject localhost and private IPs in production
  // (This can be relaxed for development if needed)
  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return {
      isValid: false,
      error: 'Webhook URL cannot point to localhost or private IP addresses for security reasons',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates webhook URL and throws an error if invalid
 * Useful for early validation in application initialization
 * 
 * @param url - The webhook URL to validate
 * @throws Error if the URL is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   assertValidWebhookUrl(import.meta.env.VITE_WEBHOOK_URL);
 * } catch (error) {
 *   console.error('Invalid webhook configuration:', error.message);
 * }
 * ```
 */
export function assertValidWebhookUrl(url: string | undefined | null): void {
  const validation = validateWebhookUrl(url);
  if (!validation.isValid) {
    throw new Error(`Invalid webhook URL: ${validation.error}`);
  }
}
