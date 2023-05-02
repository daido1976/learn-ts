import { getToken } from "./token.mjs";
import { analyzeImage } from "./vision.mjs";

const token = await getToken();
const res = await analyzeImage(token);
console.log(res);
