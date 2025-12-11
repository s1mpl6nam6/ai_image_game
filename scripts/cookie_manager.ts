import { cookies } from "next/headers";

export async function addToCookie(image_id: number) {
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
}

export async function getSeenCookies() {
  const cookiesStore = await cookies();
  const cookies_seen = cookiesStore.get("seen_images");
  let seen = JSON.parse(cookies_seen ? cookies_seen.value : "[]");

  if (!seen) {
    seen = "[]";
  }

  return seen;
}
