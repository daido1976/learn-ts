// @ts-check
import { convertTo, canBeConvertedToPDF } from "@shelf/aws-lambda-libreoffice";
import fs from "fs";
import path from "path";

/**
 * @param {{file: string, fileName: string}} event
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
export const handler = async (event) => {
  console.log("hello world from local");
  const tmpPath = process.env.HOME ?? "/tmp";
  console.log("event", JSON.stringify(event));
  const fileContent = Buffer.from(event.file, "base64");
  const fileName = event.fileName;

  try {
    // ファイルをローカルに保存
    const filePath = path.join(tmpPath, fileName);
    console.log("filePath", filePath);
    fs.writeFileSync(filePath, fileContent);

    // ファイルがPDFに変換可能か確認
    if (!canBeConvertedToPDF(fileName)) {
      throw new Error(`ファイル ${fileName} はPDFに変換できません`);
    }

    // ファイルをPDFに変換
    const outputFilePath = await convertTo(fileName, "pdf");

    // PDFファイルをBase64エンコード
    const pdfBuffer = fs.readFileSync(outputFilePath);

    return {
      statusCode: 200,
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true,
      headers: {
        "Content-Type": "application/pdf",
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
