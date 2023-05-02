// Natural Language API にテキストを送信
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
