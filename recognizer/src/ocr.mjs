import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

function buildFilePath() {
  // TODO: support relative path
  const argPath = process.argv[2];
  if (argPath) {
    return argPath;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return `${__dirname}/../tmp/image.jpg`;
}

async function loadImageAsBase64(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString("base64");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

const base64Image = await loadImageAsBase64(buildFilePath());

const requestJson = {
  requests: [
    {
      image: {
        content: base64Image,
      },
      features: [
        {
          type: "TEXT_DETECTION",
          maxResults: 1,
          model: "builtin/latest",
        },
      ],
    },
  ],
};

export async function analyzeImage(accessToken) {
  try {
    const response = await fetch(
      "https://vision.googleapis.com/v1/images:annotate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(requestJson),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export function extractTextFrom(visionResponse) {
  const textAnnotations = visionResponse.responses[0].textAnnotations;
  if (textAnnotations && textAnnotations.length > 0) {
    return textAnnotations[0].description;
  }
  return null;
}
