/**
 * Rate limiting utility for Supabase Edge Functions
 * 
 * Provides in-memory rate limiting based on identifiers (user ID, IP address, etc.)
 * 
 * Note: This is an in-memory implementation suitable for development and small-scale deployments.
 * For production at scale, consider using Redis (e.g., Upstash) for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limit tracking
// Key format: "identifier:endpoint" -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval to remove expired entries (runs every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// Start cleanup interval if not already started
let cleanupInterval: number | null = null

function startCleanupInterval() {
  if (cleanupInterval !== null) return
  
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL) as unknown as number
}

/**
 * Checks if a request should be rate limited
 * 
 * @param identifier - Unique identifier for rate limiting (user ID, IP address, etc.)
 * @param endpoint - Endpoint name for scoping rate limits
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with `allowed` boolean and `retryAfter` seconds if rate limited
 * 
 * @example
 * ```typescript
 * const result = checkRateLimit(userId, 'help-request', 5, 60000) // 5 requests per minute
 * if (!result.allowed) {
 *   return new Response(..., { status: 429, headers: { 'Retry-After': result.retryAfter } })
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  startCleanupInterval()
  
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }
  
  // Increment count
  entry.count++
  const remaining = maxRequests - entry.count
  
  return { allowed: true, remaining }
}

/**
 * Extracts IP address from request headers
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 * 
 * @param req - Request object
 * @returns IP address string or null if not found
 */
export function getClientIP(req: Request): string | null {
  // Check X-Forwarded-For header (first IP in chain)
  const forwardedFor = req.headers.get('X-Forwarded-For')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0] || null
  }
  
  // Check X-Real-IP header
  const realIP = req.headers.get('X-Real-IP')
  if (realIP) {
    return realIP.trim()
  }
  
  // Check CF-Connecting-IP (Cloudflare)
  const cfIP = req.headers.get('CF-Connecting-IP')
  if (cfIP) {
    return cfIP.trim()
  }
  
  return null
}

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // User-based rate limits (by user ID)
  USER_HELP_REQUEST: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
  USER_NOTIFICATION: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  USER_PLANO_ESTUDO: { maxRequests: 3, windowMs: 60000 }, // 3 requests per minute
  
  // IP-based rate limits (for public endpoints)
  IP_PUBLIC_WEBHOOK: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute per IP
  IP_AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute per IP
} as const
