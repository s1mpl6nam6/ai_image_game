"use server";

import { grab_from_db } from "./db";
import { fetch_runware_images } from "./fetch_images";
import { gen_three } from "./generate_ai_prompts";

export async function new_round(setLoadingStatus: (value: string) => {}) {
  setLoadingStatus("Generating Prompts");
  let gen_prompts: string[] = [];
  try {
    gen_prompts = await gen_three();
  } catch (e: unknown) {
    setLoadingStatus("Unexpected error with Prompt Generation");
    if (e instanceof Error) {
      setLoadingStatus("Error Generating Prompts: " + e.message);
			const {gen_prompts, url} = await grab_from_db()
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
			// ! go to db here
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
