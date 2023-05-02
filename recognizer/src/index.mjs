import { getToken } from "./token.mjs";
import { analyzeImage, extractTextFrom } from "./ocr.mjs";
import { analyzeEntities, extractContactInfo } from "./nlp.mjs";

const token = await getToken();
const text = extractTextFrom(await analyzeImage(token));
console.log(text);
const result = extractContactInfo(await analyzeEntities(token, text));
console.log(result);
