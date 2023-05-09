import { env } from "$env/dynamic/private";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
const supabaseKey = env.SUPABASE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase