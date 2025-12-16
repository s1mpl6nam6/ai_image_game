"use server";

import { getSeenCookies } from "./cookie_getter";
import { fetch_runware_images } from "./fetch_images";
import { gen_three } from "./generate_ai_prompts";
import {
  grabFromDB,
  addToDB,
  getDbLength,
} from "@/scripts/supabase/db_functions";

const tableName = "imagesAndPrompts";

export async function new_round(setLoadingStatus: (value: string) => void) {
  const getting_seen = getSeenCookies();

  const db_length = await getDbLength();

  const seen = await getting_seen;
  if (!seen || seen.length >= db_length) {
    console.log("Generating new Question");
    return await genNewQuestion();
  }
  console.log(seen);
  console.log("Grabbing from DB");
  return await grabFromDB();
}

async function genNewQuestion() {
  // setLoadingStatus("Generating Prompts");
  let gen_prompts: string[] = [];
  try {
    gen_prompts = await gen_three();
  } catch (e: unknown) {
    // setLoadingStatus("Unexpected error with Prompt Generation");
    if (e instanceof Error) {
      // setLoadingStatus("Error Generating Prompts: " + e.message);
      const { gen_prompts, correct_prompt, url, id } = (await grabFromDB(
        false
      )) ?? { gen_prompts: [], correct_prompt: -1, url: "", id: -1 };
      return { gen_prompts, correct_prompt, url, id };
    }
    return;
  }

  let correctPromptNum: number = Math.floor(Math.random() * 3);
  // setLoadingStatus("Generating Images");
  const prompt = gen_prompts[correctPromptNum];
  let img_url = "";

  try {
    img_url = (await fetch_runware_images(prompt)) ?? "";
  } catch (e) {
    // setLoadingStatus("Unexpected error with Prompt Generation");
    console.error("Error Generating Images");
    console.error(e)
    if (e instanceof Error) {
      // setLoadingStatus("Error Generating Images: " + e.message);
      const { gen_prompts, correct_prompt, url, id } = (await grabFromDB(
        false
      )) ?? { gen_prompts: [], correct_prompt: -1, url: "", id: -1 };
      return { gen_prompts, correct_prompt, url, id };
    }
    return;
  }

  // setLoadingStatus("Loading");

  const payload = {
    gen_prompts: gen_prompts,
    correct_prompt: correctPromptNum,
    url: img_url,
  };

  const id = addToDB(payload);
  const output = {
    gen_prompts: gen_prompts,
    correct_prompt: correctPromptNum,
    url: img_url,
    id: id,
  };
  return output;
}
