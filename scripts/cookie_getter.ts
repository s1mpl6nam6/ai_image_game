"use server";

import { cookies } from "next/headers";

export async function getSeenCookies() {
  const cookiesStore = await cookies();
  const cookies_seen = cookiesStore.get("seen_images");
  let seen = JSON.parse(cookies_seen ? cookies_seen.value : "[]");

  if (!seen) {
    seen = "[]";
  }

  return seen;
}

