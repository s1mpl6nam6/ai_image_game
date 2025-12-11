import { NextResponse } from "next/server";
import { supabase } from "./client";
import { addToCookie } from "../cookie_manager";

const tableName = "imagesAndPrompts";

export async function addToDB(prompts: string[], correct_prompt: number, url: string) {
  const supabaseURL = await addImageToBucket(url);

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      prompt0: prompts[0],
      prompt1: prompts[1],
      prompt2: prompts[2],
      correct_prompt: correct_prompt,
      url: supabaseURL,
    })
    .select();

  if (error) console.error(error);

  if (data) {
    addToCookie(data[0].id);
  }
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
    .from("imagesGenerated") // your bucket name
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