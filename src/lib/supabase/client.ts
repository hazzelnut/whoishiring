import { env } from "$env/dynamic/private";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase