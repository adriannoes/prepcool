import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from 'https://esm.sh/zod@3.23.8'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'
import { stringArraySchema, nonEmptyStringSchema } from '../_shared/validation.ts'
import { checkRateLimit, RateLimitPresets } from '../_shared/rateLimit.ts'

// Valid area of interest values
const AREA_INTERESSE_VALUES = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Português',
  'Literatura',
  'Inglês',
  'Espanhol',
  'Artes',
  'Educação Física'
] as const

// Zod schema for request body validation
const gerarPlanoEstudoSchema = z.object({
  respostas: z.object({
    habilidades_para_melhorar: stringArraySchema(1).min(1, {
      message: 'At least one skill must be selected'
    }),
    area_interesse: z.enum(AREA_INTERESSE_VALUES, {
      errorMap: () => ({ message: 'Invalid area of interest' })
    }).optional()
  })
})

serve(async (req) => {
  const origin = req.headers.get('Origin')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const corsHeaders = getCorsHeaders(origin)
  // Cria o cliente Supabase com o contexto do usuário autenticado
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  )

  // Obtém a sessão do usuário
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: "not_authenticated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    })
  }

  // Rate limiting: 3 requests per minute per user
  const rateLimitResult = checkRateLimit(
    session.user.id,
    'gerarPlanoEstudo',
    RateLimitPresets.USER_PLANO_ESTUDO.maxRequests,
    RateLimitPresets.USER_PLANO_ESTUDO.windowMs
  )

  if (!rateLimitResult.allowed) {
    const retryAfter = rateLimitResult.retryAfter || 60
    return new Response(
      JSON.stringify({
        error: "rate_limit_exceeded",
        message: "Too many requests. Please wait before generating another study plan.",
        retryAfter
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": RateLimitPresets.USER_PLANO_ESTUDO.maxRequests.toString(),
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
  const validationResult = gerarPlanoEstudoSchema.safeParse(body)
  
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

  const { respostas } = validationResult.data
  const usuario_id = session.user.id

  // 1. Buscar tópicos das habilidades marcadas
  const habilidades = respostas.habilidades_para_melhorar
  const areaInteresse = respostas.area_interesse

  // Buscar tópicos relacionados às habilidades
  let topicos: any[] = []
  for (const habilidade of habilidades) {
    const { data: topicosData, error: topicosError } = await supabaseClient
      .from('topico')
      .select('id, nome, disciplina_id')
      .ilike('nome', `%${habilidade}%`)
    if (topicosError) continue
    if (topicosData) {
      topicos = topicos.concat(topicosData)
    }
  }

  // Se área de interesse for marcada, buscar tópicos dessa área também
  if (areaInteresse) {
    // Buscar disciplinas da área
    const { data: disciplinasData } = await supabaseClient
      .from('disciplina')
      .select('id, nome')
      .ilike('nome', `%${areaInteresse}%`)
    if (disciplinasData) {
      for (const disciplina of disciplinasData) {
        const { data: topicosArea } = await supabaseClient
          .from('topico')
          .select('id, nome, disciplina_id')
          .eq('disciplina_id', disciplina.id)
        if (topicosArea) {
          topicos = topicos.concat(topicosArea)
        }
      }
    }
  }

  // Remover tópicos duplicados
  const topicosUnicos = Array.from(new Map(topicos.map(t => [t.id, t])).values())

  // 2. Para cada tópico, buscar 1 vídeo e 1 simulado
  let planoItems: any[] = []
  let prioridade = 1
  for (const topico of topicosUnicos) {
    // Buscar vídeo
    const { data: videos } = await supabaseClient
      .from('video')
      .select('id')
      .eq('topico_id', topico.id)
      .limit(1)
    if (videos && videos.length > 0) {
      planoItems.push({
        usuario_id,
        topico_id: topico.id,
        origem: 'diagnostico',
        tipo: 'video',
        prioridade,
        status: 'pendente'
      })
      prioridade++
    }
    // Buscar simulado (por disciplina)
    if (topico.disciplina_id) {
      const { data: simulados } = await supabaseClient
        .from('simulado')
        .select('id')
        .ilike('instituicao', '%') // pega qualquer simulado
        .limit(1)
      if (simulados && simulados.length > 0) {
        planoItems.push({
          usuario_id,
          topico_id: topico.id,
          origem: 'diagnostico',
          tipo: 'simulado',
          prioridade,
          status: 'pendente'
        })
        prioridade++
      }
    }
  }

  // 3. Inserir itens no plano_estudo
  let inseridos = 0
  if (planoItems.length > 0) {
    const { error: insertError } = await supabaseClient
      .from('plano_estudo')
      .insert(planoItems)
    if (!insertError) inseridos = planoItems.length
  }

  return new Response(
    JSON.stringify({
      message: `Plano de estudos gerado com ${inseridos} itens personalizados`,
      itens_criados: inseridos,
      success: true
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": RateLimitPresets.USER_PLANO_ESTUDO.maxRequests.toString(),
        "X-RateLimit-Remaining": (rateLimitResult.remaining || 0).toString()
      }
    }
  )
}) 