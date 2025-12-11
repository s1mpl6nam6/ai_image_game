"use server";

import { getSeenCookies } from "./cookie_manager";
import { fetch_runware_images } from "./fetch_images";
import { gen_three } from "./generate_ai_prompts";
import { supabase } from "@/scripts/supabase/client";
import { grabFromDB } from "@/scripts/supabase/get_images";

const tableName = "imagesAndPrompts";

export async function new_round(setLoadingStatus: (value: string) => {}) {
  const getting_seen = getSeenCookies();

  const db_length =
    (await supabase.from(tableName).select("*", { count: "exact", head: true }))
      .count ?? 0;

  const seen = await getting_seen;

  if (!seen || seen.length > db_length) {
    return await genNewQuestion(setLoadingStatus);
  }

  return await grabFromDB();
}

async function genNewQuestion(setLoadingStatus: (value: string) => {}) {
  setLoadingStatus("Generating Prompts");
  let gen_prompts: string[] = [];
  try {
    gen_prompts = await gen_three();
  } catch (e: unknown) {
    setLoadingStatus("Unexpected error with Prompt Generation");
    if (e instanceof Error) {
      setLoadingStatus("Error Generating Prompts: " + e.message);
      const { gen_prompts, correct_prompt, url } = (await grabFromDB(
        false
      )) ?? { gen_prompts: [], correct_prompt: -1, url: "" };
    }
    return;
  }
  
  const correctPromptNum: number = Math.floor(Math.random() * 3);
  setLoadingStatus("Generating Images");
  const prompt = gen_prompts[correctPromptNum];
  let img_url = "";

  try {
    img_url = (await fetch_runware_images(prompt)) ?? "";
  } catch (e) {
    setLoadingStatus("Unexpected error with Prompt Generation");
    if (e instanceof Error) {
      setLoadingStatus("Error Generating Images: " + e.message);
      const { gen_prompts, correct_prompt, url } = (await grabFromDB(
        false
      )) ?? { gen_prompts: [], correct_prompt: -1, url: "" };
    }
    return;
  }

  setLoadingStatus("Loading");

  return {
    prompts: [],
    correctPrompt: 0,
    url: "",
  };
}

