
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from simuladoDone webhook!")

serve(async (req) => {
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

  // Extract the request body
  const { simulado_id, usuario_id } = await req.json()
  
  console.log(`Processing simulado completion for user ${usuario_id}, simulado ${simulado_id}`)
  
  if (!session) {
    return new Response(JSON.stringify({ error: "not_authenticated" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    })
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
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
