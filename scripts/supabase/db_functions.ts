"use server";

import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { setCookie } from "../cookie_sender";

import "dotenv/config";
import { FileOutput } from "lucide-react";
import { error } from "console";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_API_SECRET_KEY!
);

const tableName = "imagesAndPrompts";

export async function grabFromDB(unique: boolean = true, seen?: string[]) {
  let selectedRow;

  if (!unique || !seen) {
    const { count } = await supabase
      .from(tableName)
      .select("id", { count: "exact", head: true });

    const offset = Math.floor(Math.random() * (count ?? 0));

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(offset, offset);

    if (error) throw error;
    if (!data?.length) throw new Error("No row returned");
    console.log("This is data: " + data!)

    selectedRow = data[0];
  } else {
    if (!seen) {
      return console.error("Cookies needed if unique is true");
    }

    const list = `(${seen.join(",")})`;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .not("id", "in", list)
      .limit(50);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Data is null");
    if (!data?.length) throw new Error("No unseen rows");
    console.log("This is data: " + data!)
    selectedRow = data[Math.floor(Math.random() * data.length)];
  }
  if (!selectedRow) {
    throw new Error("Selected row is null");
  }
  try {
    const output = {
      gen_prompts: [
        selectedRow.prompt_0,
        selectedRow.prompt_1,
        selectedRow.prompt_2,
      ],
      correct_prompt: selectedRow.correct_prompt,
      url: selectedRow.url,
      id: selectedRow.id,
    };
    return output;
  } catch (e) {
    console.error("Error returning from db:" + e);
  }
}

export async function addToDB({
  gen_prompts,
  correct_prompt,
  url,
}: {
  gen_prompts: string[];
  correct_prompt: number;
  url: string;
}) {
  const supabaseURL = await addImageToBucket(url);

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      prompt_0: gen_prompts[0],
      prompt_1: gen_prompts[1],
      prompt_2: gen_prompts[2],
      correct_prompt: correct_prompt,
      url: supabaseURL,
    })
    .select();

  if (error) console.error(error);

  let id = -1;
  if (data) {
    id = data[0].id;
  }
  return id;
}

export async function getDbLength() {
  const db_length =
    (await supabase.from(tableName).select("*", { count: "exact", head: true }))
      .count ?? 0;
  return db_length;
}

async function addImageToBucket(imageURL: string) {
  const res = await fetch(imageURL);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 400 }
    );
  }

  // Download image to server
  const contentType = res.headers.get("content-type") ?? "image/png";
  const fileType = contentType.split("/")[1] || "png";
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `uploads/${crypto.randomUUID()}.${fileType}`;

  const { error: uploadError } = await supabase.storage
    .from("imagesGenerated")
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error(uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("imagesGenerated").getPublicUrl(filePath);

  return publicUrl;
}
