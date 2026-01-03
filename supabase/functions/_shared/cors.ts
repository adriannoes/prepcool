/**
 * CORS utility functions for Supabase Edge Functions
 * 
 * Provides secure CORS header generation with origin validation
 * to prevent unauthorized cross-origin requests.
 */

/**
 * Gets the list of allowed origins from environment variable
 * 
 * @returns Array of allowed origin URLs, or empty array if not configured
 */
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS');
  
  if (!allowedOriginsEnv) {
    return [];
  }

  // Split by comma and trim whitespace
  return allowedOriginsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
}

/**
 * Validates if an origin is in the allowed origins list
 * 
 * @param origin - The origin to validate (from request header)
 * @param allowedOrigins - Array of allowed origin URLs
 * @returns true if origin is allowed, false otherwise
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Support for wildcard subdomains (e.g., *.example.com)
  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.substring(2); // Remove '*.' prefix
      try {
        const originUrl = new URL(origin);
        if (originUrl.hostname.endsWith('.' + domain) || originUrl.hostname === domain) {
          return true;
        }
      } catch {
        // Invalid URL format, skip
        continue;
      }
    }
  }

  return false;
}

/**
 * Generates CORS headers with origin validation
 * 
 * Validates the request origin against ALLOWED_ORIGINS environment variable.
 * If origin is allowed, returns it in Access-Control-Allow-Origin header.
 * If not allowed or not configured, returns null for Access-Control-Allow-Origin
 * (which effectively blocks the request).
 * 
 * @param origin - The origin from the request header (req.headers.get('Origin'))
 * @returns Object with CORS headers including validated origin
 * 
 * @example
 * ```typescript
 * const origin = req.headers.get('Origin');
 * const corsHeaders = getCorsHeaders(origin);
 * return new Response('ok', { headers: corsHeaders });
 * ```
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();

  // If no allowed origins configured, deny all (security by default)
  if (allowedOrigins.length === 0) {
    console.warn('ALLOWED_ORIGINS not configured. CORS requests will be denied.');
    return {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };
  }

  // Validate origin
  const originAllowed = isOriginAllowed(origin, allowedOrigins);

  if (!originAllowed) {
    console.warn(`CORS: Origin "${origin}" is not in allowed list. Request denied.`);
    // Return headers without Access-Control-Allow-Origin to deny the request
    return {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };
  }

  // Origin is allowed, include it in the response
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handles CORS preflight (OPTIONS) requests
 * 
 * @param origin - The origin from the request header
 * @returns Response for OPTIONS request with appropriate CORS headers
 */
export function handleCorsPreflight(origin: string | null): Response {
  const corsHeaders = getCorsHeaders(origin);
  return new Response('ok', { headers: corsHeaders });
}
