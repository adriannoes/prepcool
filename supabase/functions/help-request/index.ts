
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HelpRequest {
  assunto: string;
  mensagem: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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

    // Parse and validate request body
    const body: HelpRequest = await req.json()
    
    // Input validation
    if (!body.assunto || !body.mensagem) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Sanitize inputs
    const sanitizedAssunto = body.assunto.trim().substring(0, 200)
    const sanitizedMensagem = body.mensagem.trim().substring(0, 1000)
    
    if (!sanitizedAssunto || !sanitizedMensagem) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
