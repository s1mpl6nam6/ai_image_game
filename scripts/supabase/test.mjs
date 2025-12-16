import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_API_SECRET_KEY;

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing SUPABASE_API_SECRET_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const tableName = "imagesAndPrompts";

const row = {
  url: "https://picsum.photos/400",
  prompt_0: "Apple",
  prompt_1: "Banana",
  prompt_2: "Orange",
  correct_prompt: 2,
};

try {
  const { data, error } = await supabase.from(tableName).insert(row).select();

  if (error) {
    console.error("❌ Supabase error:", error);
    process.exit(1);
  }

  console.log("✅ Inserted:", data);
} catch (e) {
  console.error("❌ Thrown error:", e);
  process.exit(1);
}
