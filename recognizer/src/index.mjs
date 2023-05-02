import { getToken } from "./token.mjs";
import { analyzeImage, extractTextFrom } from "./ocr.mjs";
import { analyzeEntities, extractContactInfoFrom } from "./nlp.mjs";

async function main() {
  try {
    const token = await getToken();
    if (!token) {
      console.error("Unable to get access token.");
      return;
    }

    const visionResponse = await analyzeImage(token);
    if (!visionResponse) {
      console.error("Unable to analyze image.");
      return;
    }

    const text = extractTextFrom(visionResponse);
    console.log("---OCR Result---\n", text);

    // @ts-ignore
    const nlResponse = await analyzeEntities(token, text);
    if (!nlResponse) {
      console.error("Unable to analyze entities.");
      return;
    }

    const result = extractContactInfoFrom(nlResponse);
    console.log("---NLP Result---\n", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
