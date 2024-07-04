import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { convertTo, canBeConvertedToPDF } from "@shelf/aws-lambda-libreoffice";
import fs from "fs";
import path from "path";

const s3 = new S3Client({ region: "ap-northeast-1" });

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
export const handler = async (event) => {
  const sourceBucketName = process.env.SOURCE_S3_BUCKET_NAME; // 元バケット名
  const destinationBucketName = process.env.DESTINATION_S3_BUCKET_NAME; // 先バケット名
  const objectKey = decodeURIComponent(event.rawPath.substring(1)); // パスからキーを取得
  const tmpPath = process.env.HOME ?? "/tmp";
  console.log("event", JSON.stringify(event));
  console.log({ objectKey, sourceBucketName, destinationBucketName, tmpPath });

  try {
    // S3からファイルをダウンロード
    const getObjectParams = { Bucket: sourceBucketName, Key: objectKey };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const data = await s3.send(getObjectCommand);

    if (!data.Body) {
      throw new Error(`ファイル ${objectKey} の内容を取得できません`);
    }

    const fileName = path.basename(objectKey);

    // ファイルをローカルに保存
    const fileBytes = await data.Body.transformToByteArray();
    fs.writeFileSync(path.join(tmpPath, fileName), Buffer.from(fileBytes));

    // ファイルがPDFに変換可能か確認
    if (!canBeConvertedToPDF(fileName)) {
      throw new Error(`ファイル ${objectKey} はPDFに変換できません`);
    }

    // ファイルをPDFに変換
    const outputFilePath = await convertTo(fileName, "pdf");

    // 変換後のファイルをS3にアップロード
    const outputKey = `${fileName}.preview`;
    const putObjectParams = {
      Bucket: destinationBucketName,
      Key: outputKey,
      Body: fs.createReadStream(outputFilePath),
      ContentType: "application/pdf",
    };
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    await s3.send(putObjectCommand);

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
