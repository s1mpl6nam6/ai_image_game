"use server";

import "dotenv/config";
import { Runware } from "@runware/sdk-js";

runware_api_key = process.env.RUNWARE_API_KEY;
if (!runware_api_key) {
  throw new Error("Runware API key not found");
}

const runware = new Runware({ apiKey: runware_api_key });

export async function fetch_runware_images(prompt) {
  const model = "runware:101@1";
	const images = await runware.requestImages({
		positivePrompt: prompt,
		model: model,
		width: 400,
		height: 400
	})

	return images[0].imageURL;
}

export async function fetch_im_rout_images(prompt) {
  const url = "https://api.imagerouter.io/v1/openai/images/generations";
  const api_key = process.env.IMAGE_ROUTER_API_KEY;

  if (!api_key) {
    throw new Error("Image Router API key not found");
  }

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: prompt, model: "qwen/qwen-image:free" }),
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new Error(
      "Error fetching image from API:" + JSON.stringify(errorData)
    );
  }
  const json = await response.json();
  if (!json.data || !json.data[0]) {
    throw new Error("API returned no data: " + JSON.stringify(json));
  }
  const data = json.data?.[0];
  return data;
}
