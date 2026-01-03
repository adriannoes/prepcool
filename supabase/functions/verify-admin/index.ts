import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'

/**
 * Edge Function to verify if a user has administrative privileges
 * 
 * This function:
 * 1. Verifies the JWT token from the Authorization header
 * 2. Checks if the user exists in the admin_users table
 * 3. Returns { isAdmin: boolean }
 * 
 * Security:
 * - Requires valid JWT token
 * - Uses RLS policies to ensure only authorized checks
 * - Returns false on any error (fail-secure)
 */

serve(async (req) => {
  const origin = req.headers.get('Origin')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const corsHeaders = getCorsHeaders(origin)

  try {
    // Only allow GET and POST methods
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          isAdmin: false,
          error: 'Unauthorized' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user is in admin_users table
    const { data: adminRecord, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    // If there's an error (including no rows found), user is not admin
    if (adminError || !adminRecord) {
      return new Response(
        JSON.stringify({ 
          isAdmin: false 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // User is admin
    return new Response(
      JSON.stringify({ 
        isAdmin: true 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in verify-admin:', error)
    
    // Fail-secure: return false on any error
    return new Response(
      JSON.stringify({ 
        isAdmin: false,
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
