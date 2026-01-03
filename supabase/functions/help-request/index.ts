
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'
import { nonEmptyStringSchema, sanitizeHtml } from '../_shared/validation.ts'
import { checkRateLimit, RateLimitPresets } from '../_shared/rateLimit.ts'

// Zod schema for request body validation
const helpRequestSchema = z.object({
  assunto: nonEmptyStringSchema(200, 'Assunto'),
  mensagem: nonEmptyStringSchema(1000, 'Mensagem')
})

serve(async (req) => {
  const origin = req.headers.get('Origin')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const corsHeaders = getCorsHeaders(origin)

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Rate limiting: 5 requests per minute per user
    const rateLimitResult = checkRateLimit(
      user.id,
      'help-request',
      RateLimitPresets.USER_HELP_REQUEST.maxRequests,
      RateLimitPresets.USER_HELP_REQUEST.windowMs
    )

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 60
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: 'Too many requests. Please wait before sending another request.',
          retryAfter
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RateLimitPresets.USER_HELP_REQUEST.maxRequests.toString(),
            'X-RateLimit-Remaining': '0'
          },
          status: 429
        }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: 'invalid_json',
          message: 'Invalid JSON format in request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Validate request body with Zod schema
    const validationResult = helpRequestSchema.safeParse(body)
    
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Sanitize inputs to remove HTML/script tags
    const sanitizedAssunto = sanitizeHtml(validationResult.data.assunto.trim())
    const sanitizedMensagem = sanitizeHtml(validationResult.data.mensagem.trim())
    
    // Double-check after sanitization (in case sanitization removed everything)
    if (!sanitizedAssunto || !sanitizedMensagem) {
      return new Response(
        JSON.stringify({ 
          error: 'invalid_input',
          message: 'Input data is invalid after sanitization'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get user profile data
    const { data: userProfile } = await supabaseClient
      .from('usuario')
      .select('nome, email, telefone')
      .eq('id', user.id)
      .single()

    // Prepare webhook payload
    const payload = {
      usuario_id: user.id,
      nome: userProfile?.nome || 'Usuário não identificado',
      email: userProfile?.email || user.email,
      telefone: userProfile?.telefone || 'Não informado',
      assunto: sanitizedAssunto,
      mensagem: sanitizedMensagem,
      origem: 'dashboard-secure',
      timestamp: new Date().toISOString(),
    }

    console.log('Processing help request for user:', user.id)

    // Send to Pipefy webhook
    const webhookUrl = Deno.env.get('PIPEFY_WEBHOOK_URL')
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured')
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PrepCool-HelpSystem/1.0',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Webhook failed:', response.status, response.statusText)
      throw new Error(`Webhook failed: ${response.status}`)
    }

    // Log the help request for audit purposes
    await supabaseClient
      .from('notificacao')
      .insert({
        usuario_id: user.id,
        tipo: 'help_request',
        mensagem: `Pedido de ajuda enviado: ${sanitizedAssunto}`,
        lida: true
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Solicitação enviada com sucesso!' 
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RateLimitPresets.USER_HELP_REQUEST.maxRequests.toString(),
          'X-RateLimit-Remaining': (rateLimitResult.remaining || 0).toString()
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing help request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Erro interno do servidor. Tente novamente.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
