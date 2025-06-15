import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from gerarPlanoEstudo!")

serve(async (req) => {
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
      headers: { "Content-Type": "application/json" },
      status: 401,
    })
  }

  // Extrai o body da requisição
  let body
  try {
    body = await req.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }

  const { respostas } = body
  const usuario_id = session.user.id

  if (!respostas || !respostas.habilidades_para_melhorar || !Array.isArray(respostas.habilidades_para_melhorar)) {
    return new Response(JSON.stringify({ error: "diagnostico_incompleto" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }

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
    { headers: { "Content-Type": "application/json" } }
  )
}) 