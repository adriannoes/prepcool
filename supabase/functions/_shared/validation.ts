/**
 * Shared validation utilities for Supabase Edge Functions
 * 
 * Provides common Zod schemas and validation helpers to ensure
 * consistent input validation across all Edge Functions.
 */

import { z } from 'https://esm.sh/zod@3.23.8'

/**
 * UUID validation schema
 * Validates that a string is a valid UUID v4 format
 */
export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
})

/**
 * URL validation schema
 * Validates that a string is a valid URL format
 */
export const urlSchema = z.string().url({
  message: 'Invalid URL format'
}).optional()

/**
 * Creates an enum validation schema
 * 
 * @param enumObject - The enum object to validate against
 * @param errorMessage - Custom error message for invalid enum values
 * @returns Zod enum schema
 * 
 * @example
 * ```typescript
 * enum NotificationType {
 *   INFO = 'info',
 *   WARNING = 'warning',
 *   ERROR = 'error',
 *   HELP_REQUEST = 'help_request'
 * }
 * 
 * const notificationTypeSchema = createEnumSchema(
 *   NotificationType,
 *   'Invalid notification type'
 * )
 * ```
 */
export function createEnumSchema<T extends Record<string, string>>(
  enumObject: T,
  errorMessage: string = 'Invalid enum value'
): z.ZodEnum<[T[keyof T], ...T[keyof T][]]> {
  const values = Object.values(enumObject) as [T[keyof T], ...T[keyof T][]]
  return z.enum(values, {
    errorMap: () => ({ message: errorMessage })
  })
}

/**
 * Non-empty string schema with optional max length
 * 
 * @param maxLength - Maximum allowed length (optional)
 * @param fieldName - Name of the field for error messages
 * @returns Zod string schema
 */
export function nonEmptyStringSchema(
  maxLength?: number,
  fieldName: string = 'Field'
): z.ZodString {
  let schema = z.string().min(1, { message: `${fieldName} cannot be empty` })
  
  if (maxLength) {
    schema = schema.max(maxLength, {
      message: `${fieldName} must be at most ${maxLength} characters`
    })
  }
  
  return schema
}

/**
 * Array of strings schema with optional validation
 * 
 * @param minLength - Minimum array length (optional)
 * @param maxLength - Maximum array length (optional)
 * @returns Zod array schema
 */
export function stringArraySchema(
  minLength?: number,
  maxLength?: number
): z.ZodArray<z.ZodString> {
  let schema = z.array(z.string())
  
  if (minLength !== undefined) {
    schema = schema.min(minLength, {
      message: `Array must have at least ${minLength} items`
    })
  }
  
  if (maxLength !== undefined) {
    schema = schema.max(maxLength, {
      message: `Array must have at most ${maxLength} items`
    })
  }
  
  return schema
}

/**
 * Sanitizes HTML/script tags from a string
 * Removes potentially dangerous HTML tags and script content
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:\s*text\/html/gi, '')
  
  return sanitized.trim()
}
