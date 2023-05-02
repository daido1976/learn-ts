import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

/**
 * ファイルパスを構築する
 * @returns {string} ファイルパス
 */
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

/**
 * ローカルファイルを Base64 形式で読み込む
 * @param {string} filePath ファイルパス
 * @returns {Promise<string | null>} Base64 形式の画像データ
 */
async function loadImageAsBase64(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString("base64");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

/**
 * リクエスト用の JSON オブジェクトを構築する
 * @param {string} base64Image Base64 形式の画像データ
 * @returns {{requests: Array<{image: {content: string}, features: Array<{type: string, maxResults: number, model?: string}>}>}} リクエスト用の JSON オブジェクト
 */
function buildRequestJson(base64Image) {
  return {
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
}

/**
 * Google Cloud Vision API を利用して画像を解析する
 * @param {string} accessToken アクセストークン
 * @returns {Promise<{responses: Array<{textAnnotations: Array<{description: string}>}>} | null>} Vision API のレスポンスデータ
 */
export async function analyzeImage(accessToken) {
  const base64Image = await loadImageAsBase64(buildFilePath());
  const requestJson = buildRequestJson(base64Image);

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

/**
 * Google Cloud Vision API のレスポンスからテキストを抽出する
 * @param {{responses: Array<{textAnnotations: Array<{description: string}>}>}} visionResponse Vision API のレスポンスデータ
 * @returns {string | null} 抽出されたテキスト
 */
export function extractTextFrom(visionResponse) {
  const textAnnotations = visionResponse.responses[0].textAnnotations;
  if (textAnnotations && textAnnotations.length > 0) {
    return textAnnotations[0].description;
  }
  return null;
}
