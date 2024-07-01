import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { convertTo, canBeConvertedToPDF } from "@shelf/aws-lambda-libreoffice";
import fs from "fs";
import path from "path";

const s3 = new S3Client({ region: "ap-northeast-1" });

export const handler = async (event) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const objectKey = event.objectKey;
  const tmpPath = "/tmp";

  try {
    // S3からファイルをダウンロード
    const getObjectParams = { Bucket: bucketName, Key: objectKey };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const data = await s3.send(getObjectCommand);

    if (!data.Body) {
      throw new Error(`ファイル ${objectKey} の内容を取得できません`);
    }

    const inputFilePath = path.join(tmpPath, objectKey);

    // Uint8Arrayを使用してファイルをローカルに保存
    const fileBytes = await data.Body.transformToByteArray();
    fs.writeFileSync(inputFilePath, Buffer.from(fileBytes));

    // ファイルがPDFに変換可能か確認
    if (!canBeConvertedToPDF(inputFilePath)) {
      throw new Error(`ファイル ${objectKey} はPDFに変換できません`);
    }

    // ファイルをPDFに変換
    const outputFilePath = await convertTo(inputFilePath, "pdf");

    // 変換後のファイルをS3にアップロード
    const outputKey = `${path.parse(objectKey).name}.pdf`;
    const putObjectParams = {
      Bucket: bucketName,
      Key: outputKey,
      Body: fs.createReadStream(outputFilePath),
      ContentType: "application/pdf",
    };
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    await s3.send(putObjectCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `ファイルは${outputKey}として変換およびアップロードされました`,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
