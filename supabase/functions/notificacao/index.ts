
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'
import { uuidSchema, urlSchema, nonEmptyStringSchema, createEnumSchema } from '../_shared/validation.ts'
import { checkRateLimit, getClientIP, RateLimitPresets } from '../_shared/rateLimit.ts'

// Notification types enum
enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  HELP_REQUEST = 'help_request'
}

// Zod schema for request body validation
const notificacaoSchema = z.object({
  usuario_id: uuidSchema,
  tipo: createEnumSchema(NotificationType, 'Invalid notification type'),
  mensagem: nonEmptyStringSchema(undefined, 'Mensagem'),
  link_destino: urlSchema
})

serve(async (req) => {
  const origin = req.headers.get('Origin')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const corsHeaders = getCorsHeaders(origin)

  try {

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Rate limiting: 10 requests per minute per IP (public endpoint)
    const clientIP = getClientIP(req) || 'unknown'
    const rateLimitResult = checkRateLimit(
      clientIP,
      'notificacao',
      RateLimitPresets.USER_NOTIFICATION.maxRequests,
      RateLimitPresets.USER_NOTIFICATION.windowMs
    )

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 60
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: 'Too many requests. Please wait before sending another notification.',
          retryAfter
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RateLimitPresets.USER_NOTIFICATION.maxRequests.toString(),
            'X-RateLimit-Remaining': '0'
          },
          status: 429
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate request body
    let requestData
    try {
      requestData = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: 'invalid_json',
          message: 'Invalid JSON format in request body'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate request body with Zod schema
    const validationResult = notificacaoSchema.safeParse(requestData)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return new Response(
        JSON.stringify({ 
          error: 'validation_error',
          message: 'Invalid input data',
          details: errors
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { usuario_id, tipo, mensagem, link_destino } = validationResult.data

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuario')
      .select('id')
      .eq('id', usuario_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert notification
    const { data, error } = await supabaseAdmin
      .from('notificacao')
      .insert({
        usuario_id,
        tipo,
        mensagem,
        link_destino: link_destino || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting notification:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Notification created:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: data,
        message: 'Notification created successfully' 
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RateLimitPresets.USER_NOTIFICATION.maxRequests.toString(),
          'X-RateLimit-Remaining': (rateLimitResult.remaining || 0).toString()
        },
      },
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
