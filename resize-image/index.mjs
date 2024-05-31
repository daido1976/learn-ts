import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * @param {import('aws-lambda').CloudFrontResponseEvent} event - The CloudFront event object.
 * @param {import('aws-lambda').Context} _context - The Lambda context object.
 * @returns {Promise<import('aws-lambda').CloudFrontResponseResult>} The modified CloudFront response.
 */
export const handler = async (event, _context) => {
  // Lambda@Edgeでは環境変数が利用できないためハードコードする
  const BUCKET = "your-bucket-name";
  const s3Client = new S3Client({ region: "ap-northeast-1" });

  const originResponse = event.Records[0].cf.response;

  console.log(`Response status code: ${originResponse.status}`);

  // 画像が存在しない場合
  if (originResponse.status === "403" || originResponse.status === "404") {
    const request = event.Records[0].cf.request;
    const requestUri = request.uri;
    const subRequestUri = requestUri.substring(1);
    console.log(`requestUri: ${requestUri} -> subRequestUri: ${subRequestUri}`);

    // オリジナル画像のキーを取得
    const originalKey = subRequestUri.replace(".thumb", "");
    console.log(`Original image: ${originalKey}`);

    try {
      // オリジナル画像を取得
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET,
        Key: originalKey,
      });
      const data = await s3Client.send(getObjectCommand);
      console.log("S3.getObject success");

      if (!data.Body) {
        console.log("No image data");
        return originResponse;
      }
      const buffer = Buffer.from(await data.Body.transformToByteArray());
      console.log(`buffer length: ${buffer.length}`);

      const image = sharp(buffer);

      // 画像をリサイズ（縦横150px上限）
      const resizedBuffer = await image.resize(150).toBuffer();
      const metadata = await image.metadata();
      const mimeType =
        metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`;
      console.log(`Image resized: ${metadata.width}x${metadata.height}`);
      console.log(`MIME type: ${mimeType}`);

      // 変換後の画像ファイルをS3に保存する
      const putObjectCommand = new PutObjectCommand({
        Body: resizedBuffer,
        Bucket: BUCKET,
        ContentType: mimeType,
        CacheControl: "max-age=31536000",
        Key: subRequestUri,
        StorageClass: "STANDARD",
      });
      await s3Client.send(putObjectCommand);
      console.log("S3.putObject success");

      // 変換後の画像ファイルをそのままCloudFrontからのレスポンスとして利用する
      return {
        ...originResponse,
        status: "200",
        statusDescription: "OK",
        body: resizedBuffer.toString("base64"),
        bodyEncoding: "base64",
        headers: {
          ...originResponse.headers,
          "content-type": [{ key: "Content-Type", value: mimeType }],
        },
      };
    } catch (err) {
      console.log("Exception while processing image: %j", err);
      return originResponse;
    }
  } else {
    // 画像が存在する場合
    console.log("Image exists");
    return originResponse;
  }
};
