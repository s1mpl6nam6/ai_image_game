"use server"
import 'dotenv/config';

import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_API_SECRET_KEY!);

export { supabase };