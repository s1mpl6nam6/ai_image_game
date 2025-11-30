"use server"

import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
import {z} from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema";

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in your environment");
}

const resp_schema = z.array(z.string());

const responseJsonSchema = {
  type: "array",
  items: { type: "string" },
  minItems: 3,
  maxItems: 3,
}

// const ai = new GoogleGenAI({apiKey});

export async function gen_three() {
  // const response = await ai.models.generateContent({
  //     model: "gemini-2.5-flash-lite",
  //     contents: "Provide three (<= 20 words each) semi-descriptive prompts that all describe the same image for image generation.",
  //     config: {
  //       responseMimeType : "application/json",
  //       responseJsonSchema : responseJsonSchema,
  //     },
  // });
  // const result = (JSON.parse(response.text ?? ""));

  // ! temporary just to not exceed rate limits
  const result = [
    "Vivid cyberpunk cityscape, neon glow, wet streets, flying vehicles",
    "A solitary lighthouse stands on a rugged, misty coastline at dawn.",
    "Vintage photo of a bustling 1920s jazz club, dim light, dancing couples."
  ]
  return result
}