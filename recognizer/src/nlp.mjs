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
  const entities = nlResponse.entities;
  const contactInfo = {
    name: "",
    title: "",
    companyName: "",
    phoneNumber: "",
    email: "",
  };

  entities.forEach((entity) => {
    switch (entity.type) {
      case "PERSON":
        contactInfo.name = entity.name;
        break;
      case "ORGANIZATION":
        contactInfo.companyName = entity.name;
        break;
      case "PHONE_NUMBER":
        contactInfo.phoneNumber = entity.name;
        break;
      case "EMAIL_ADDRESS":
        contactInfo.email = entity.name;
        break;
      case "TITLE":
        contactInfo.title = entity.name;
        break;
      default:
        break;
    }
  });

  return contactInfo;
}
