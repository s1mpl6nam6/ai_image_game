import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image_id } = await req.json();

  const cookiesStore = await cookies();
  const cookies_seen = cookiesStore.get("seen_images");
  let seen = JSON.parse(cookies_seen ? cookies_seen.value : "[]");

  if (!seen) {
    seen = [];
  }

  if (!seen.includes(image_id)) {
    seen.push(image_id);
  }

  cookiesStore.set("seen_images", JSON.stringify(seen), { path: "/" });
  return NextResponse.json({ ok: true, seen }, { status: 200 });
}
