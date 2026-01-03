
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from 'https://esm.sh/zod@3.23.8'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'
import { uuidSchema } from '../_shared/validation.ts'
import { checkRateLimit, RateLimitPresets } from '../_shared/rateLimit.ts'

// Zod schema for request body validation
const simuladoDoneSchema = z.object({
  simulado_id: uuidSchema,
  usuario_id: uuidSchema
})

serve(async (req) => {
  const origin = req.headers.get('Origin')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const corsHeaders = getCorsHeaders(origin)
  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  )
  
  // Now we can get the session or user object
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  
  if (!session) {
    return new Response(JSON.stringify({ error: "not_authenticated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    })
  }

  // Rate limiting: 5 requests per minute per user
  const rateLimitResult = checkRateLimit(
    session.user.id,
    'simuladoDone',
    RateLimitPresets.USER_NOTIFICATION.maxRequests, // Reuse notification preset (10 per minute)
    RateLimitPresets.USER_NOTIFICATION.windowMs
  )

  if (!rateLimitResult.allowed) {
    const retryAfter = rateLimitResult.retryAfter || 60
    return new Response(
      JSON.stringify({
        error: "rate_limit_exceeded",
        message: "Too many requests. Please wait before processing another simulado.",
        retryAfter
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": RateLimitPresets.USER_NOTIFICATION.maxRequests.toString(),
          "X-RateLimit-Remaining": "0"
        },
        status: 429,
      }
    )
  }

  // Extract and validate request body
  let body
  try {
    body = await req.json()
  } catch (e) {
    return new Response(
      JSON.stringify({ 
        error: "invalid_json",
        message: "Invalid JSON format in request body"
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }

  // Validate request body with Zod schema
  const validationResult = simuladoDoneSchema.safeParse(body)
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    
    return new Response(
      JSON.stringify({ 
        error: "validation_error",
        message: "Invalid input data",
        details: errors
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }

  const { simulado_id, usuario_id } = validationResult.data

  // Verify that the authenticated user matches the usuario_id in the request
  if (session.user.id !== usuario_id) {
    return new Response(
      JSON.stringify({ 
        error: "unauthorized",
        message: "User can only process their own simulados"
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      }
    )
  }

  // Verify that the simulado exists and belongs to the user
  const { data: simulado, error: simuladoError } = await supabaseClient
    .from('simulado')
    .select('id')
    .eq('id', simulado_id)
    .single()

  if (simuladoError || !simulado) {
    return new Response(
      JSON.stringify({ 
        error: "not_found",
        message: "Simulado not found or access denied"
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      }
    )
  }
  
  try {
    // Here you would implement logic to generate a personalized study plan
    console.log("Generating personalized study plan...")
    
    // Fetch all the user's responses for this simulado
    const { data: respostas, error: respostasError } = await supabaseClient
      .from('resposta')
      .select('*, pergunta(*)')
      .eq('usuario_id', usuario_id)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent responses
    
    if (respostasError) throw respostasError
    
    console.log(`Received ${respostas?.length || 0} responses`)
    
    // Analyze responses to identify weak areas
    // For this example, we'll check which questions were answered incorrectly
    const incorrectAnswers = respostas?.filter(resposta => !resposta.acerto) || []
    
    // Group incorrect answers by discipline
    const disciplineToTopicMap = new Map()
    
    for (const resposta of incorrectAnswers) {
      const discipline = resposta.pergunta?.disciplina
      if (discipline && !disciplineToTopicMap.has(discipline)) {
        // Fetch topics for this discipline
        const { data: topics } = await supabaseClient
          .from('topico')
          .select('*')
          .eq('disciplina_id', resposta.pergunta.disciplina)
          .limit(3)
        
        if (topics && topics.length > 0) {
          disciplineToTopicMap.set(discipline, topics)
        }
      }
    }
    
    // Create study plan items based on incorrect answers
    const studyPlanItems = []
    let priority = 10 // Start with high priority (lower number)
    
    // For each discipline with weak spots
    for (const [discipline, topics] of disciplineToTopicMap.entries()) {
      // Add topics to study plan
      for (const topic of topics) {
        // Check if this topic already exists in user's study plan
        const { data: existingPlan } = await supabaseClient
          .from('plano_estudo')
          .select('id')
          .eq('usuario_id', usuario_id)
          .eq('topico_id', topic.id)
          .single()
        
        // If topic is not already in plan, add it
        if (!existingPlan) {
          // Add video study item
          studyPlanItems.push({
            usuario_id,
            topico_id: topic.id,
            origem: 'simulado',
            tipo: 'video',
            prioridade: priority,
            status: 'pendente'
          })
          
          // Add exercise study item with slightly lower priority
          studyPlanItems.push({
            usuario_id,
            topico_id: topic.id,
            origem: 'simulado',
            tipo: 'exercicio',
            prioridade: priority + 1,
            status: 'pendente'
          })
          
          priority += 10 // Decrease priority for next items
        }
      }
    }
    
    // Insert study plan items into database
    if (studyPlanItems.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('plano_estudo')
        .insert(studyPlanItems)
      
      if (insertError) {
        console.error('Error inserting study plan items:', insertError)
        throw insertError
      }
      
      console.log(`Created ${studyPlanItems.length} study plan items`)
    } else {
      console.log('No new study plan items to create')
    }
    
    // Successful response with a message
    return new Response(
      JSON.stringify({
        message: `Plano de estudos personalizado gerado com ${studyPlanItems.length} novos itens`,
        success: true,
        items_created: studyPlanItems.length
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RateLimitPresets.USER_NOTIFICATION.maxRequests.toString(),
          "X-RateLimit-Remaining": (rateLimitResult.remaining || 0).toString()
        }
      }
    )
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
