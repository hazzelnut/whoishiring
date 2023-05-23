
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from './schema.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseKey) throw new Error('Could not fetch environment variables SUPABASE_URL and/or SUPABASE_ANON_KEY')

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default supabase

