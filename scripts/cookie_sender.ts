"use client"

export async function setCookie(id: number) {
  const res = await fetch("/api/cookies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_id: id }),
  });

  if (!res.ok) throw new Error("Failed to set cookie");
  return res.json();
}