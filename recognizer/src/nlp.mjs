/**
 * Google Natural Language API を使用して、指定されたテキスト内のエンティティを分析する
 * @param {string} accessToken
 * @param {string} text
 * @returns {Promise<{ entities: { type: string, name: string }[] }|null>} APIからのレスポンス、またはエラーが発生した場合は null。
 */
export async function analyzeEntities(accessToken, text) {
  try {
    const response = await fetch(
      "https://language.googleapis.com/v1/documents:analyzeEntities",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: {
            type: "PLAIN_TEXT",
            language: "JA",
            content: text,
          },
          encodingType: "UTF8",
        }),
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
 * Natural Language API のレスポンスから連絡先情報を抽出する
 * @param {{ entities: { type: string, name: string }[] }} nlResponse
 * @returns {{ ORGANIZATION: string, PERSON: string, LOCATION: string, PHONE_NUMBER: string, ADDRESS: string, OTHER: string }}
 */
export function extractContactInfo(nlResponse) {
  // See. https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#type
  const requiredEntities = {
    ORGANIZATION: "",
    PERSON: "",
    LOCATION: "",
    PHONE_NUMBER: "",
    ADDRESS: "",
    OTHER: "",
  };

  for (const entity of nlResponse.entities) {
    const entityType = entity.type;
    if (requiredEntities.hasOwnProperty(entityType)) {
      requiredEntities[entityType] += entity.name;
    }
  }

  return requiredEntities;
}
