import { supabase } from "./client";
import { addToCookie } from "../cookie_manager";

const tableName = "imagesAndPrompts";

export async function grabFromDB(unique: boolean = true, seen?: string[]) {
  let selectedRow;

  if (!unique) {
    const max =
      (
        await supabase
          .from(tableName)
          .select("id", { count: "exact", head: true })
      ).count ?? 0;
    const randomId = Math.floor(Math.random() * max) + 1;
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", randomId);

    if (error) console.error(error);

    selectedRow = data?.[0] || null;
  } else {
    if (!seen) {
      return console.error("Cookies needed if unique is true");
    }

    const list = seen.join(",");

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .not("id", "in", list)
      .order("RANDOM()")
      .limit(1);

    if (error) console.error(error);

    selectedRow = data?.[0] || null;
  }

  addToCookie(selectedRow.id);
  return {
    gen_prompts: [
      selectedRow.prompt0,
      selectedRow.prompt1,
      selectedRow.prompt2,
    ],
    correct_prompt: selectedRow.correct_prompt,
    url: selectedRow.url,
  };
}
