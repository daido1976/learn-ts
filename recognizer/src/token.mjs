import jwt from "jsonwebtoken";
import keyData from "../service-account-key.json" assert { type: "json" };

/**
 * @returns {Promise<string | undefined>} アクセストークン
 */
export async function getToken() {
  // JWTを作成
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = {
    iss: keyData.client_email,
    sub: keyData.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: iat,
    exp: exp,
    scope: "https://www.googleapis.com/auth/cloud-platform",
  };

  const jwtToken = jwt.sign(payload, keyData.private_key, {
    algorithm: "RS256",
  });

  // アクセストークンを取得
  try {
    const response = await fetch(keyData.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const accessToken = data.access_token;
    return accessToken;
  } catch (error) {
    console.error("Error:", error);
    return undefined;
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
