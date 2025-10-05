
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
    // based on the user's responses to the simulado
    console.log("Generating personalized study plan...")
    
    // You might want to fetch all the user's responses for this simulado
    const { data: respostas, error: respostasError } = await supabaseClient
      .from('resposta')
      .select('*, pergunta(*)')
      .eq('usuario_id', usuario_id)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent responses
    
    if (respostasError) throw respostasError
    
    // Here you would analyze responses and create personalized recommendations
    // For now, we'll just log what we received
    console.log(`Received ${respostas?.length || 0} responses`)
    
    // Successful response with a message
    return new Response(
      JSON.stringify({
        message: "Plano de estudos personalizado sendo gerado",
        success: true,
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
