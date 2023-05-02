import jwt from "jsonwebtoken";
import keyData from "../service-account-key.json" assert { type: "json" };

const tokenEndpoint = "https://oauth2.googleapis.com/token";

/**
 * @returns {Promise<string | null>} アクセストークン
 * @see {@link https://developers.google.com/identity/protocols/oauth2/service-account}
 */
export async function getToken() {
  // JWT payload を作成
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = {
    iss: keyData.client_email,
    sub: keyData.client_email,
    aud: tokenEndpoint,
    iat,
    exp,
    scope:
      "https://www.googleapis.com/auth/cloud-vision https://www.googleapis.com/auth/cloud-language",
  };

  // JWTトークンを署名
  const jwtToken = jwt.sign(payload, keyData.private_key, {
    algorithm: "RS256",
  });

  // アクセストークンを取得
  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { access_token } = await response.json();
    return access_token;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// for local
import { execSync } from "child_process";
function copyToClipboard(text) {
  try {
    execSync(`echo "${text}" | pbcopy`);
    console.log("Text copied to clipboard successfully");
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
}
