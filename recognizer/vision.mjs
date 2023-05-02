const requestJson = {
  requests: [
    {
      image: {
        source: {
          imageUri: "https://item-shopping.c.yimg.jp/i/n/print-am_m-121-30",
        },
      },
      features: [
        {
          type: "LABEL_DETECTION",
          maxResults: 3,
        },
        {
          type: "OBJECT_LOCALIZATION",
          maxResults: 1,
        },
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
    return data.responses[0];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
