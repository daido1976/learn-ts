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
  return nlResponse.entities.reduce(
    (contactInfo, entity) => {
      switch (entity.type) {
        case "PERSON":
          return { ...contactInfo, name: entity.name };
        case "ORGANIZATION":
          return { ...contactInfo, companyName: entity.name };
        case "PHONE_NUMBER":
          return { ...contactInfo, phoneNumber: entity.name };
        case "EMAIL_ADDRESS":
          return { ...contactInfo, email: entity.name };
        case "TITLE":
          return { ...contactInfo, title: entity.name };
        default:
          return contactInfo;
      }
    },
    {
      name: "",
      title: "",
      companyName: "",
      phoneNumber: "",
      email: "",
    }
  );
}
