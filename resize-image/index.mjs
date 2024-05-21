import AWS from "aws-sdk";
import Jimp from "jimp";

/**
 * @typedef {Object} CloudFrontHeaders
 * @property {Array<{key: string, value: string}>} [strict-transport-security]
 * @property {Array<{key: string, value: string}>} [content-security-policy]
 * @property {Array<{key: string, value: string}>} [x-content-type-options]
 * @property {Array<{key: string, value: string}>} [x-frame-options]
 * @property {Array<{key: string, value: string}>} [x-xss-protection]
 * @property {Array<{key: string, value: string}>} [referrer-policy]
 */

/**
 * @typedef {Object} CloudFrontRequest
 * @property {string} uri
 * @property {string} querystring
 * @property {CloudFrontHeaders} headers
 */

/**
 * @typedef {Object} CloudFrontResponse
 * @property {string} body
 * @property {string} bodyEncoding
 * @property {string} status
 * @property {string} statusDescription
 * @property {CloudFrontHeaders} headers
 */

/**
 * @typedef {Object} CloudFrontEventRecord
 * @property {{ request: CloudFrontRequest, response: CloudFrontResponse }} cf
 */

/**
 * @typedef {Object} CloudFrontEvent
 * @property {Array<CloudFrontEventRecord>} Records
 */

/**
 * @typedef {Object} LambdaContext
 * @property {string} functionName
 * @property {string} functionVersion
 * @property {string} invokedFunctionArn
 * @property {string} memoryLimitInMB
 * @property {string} awsRequestId
 * @property {string} logGroupName
 * @property {string} logStreamName
 * @property {Function} getRemainingTimeInMillis
 * @property {Function} done
 * @property {Function} fail
 * @property {Function} succeed
 */

/**
 * @param {CloudFrontEvent} event - The CloudFront event object.
 * @param {LambdaContext} _context - The Lambda context object.
 * @returns {Promise<CloudFrontResponse>} The modified CloudFront response.
 */
export const handler = async (event, _context) => {
  // Lambda@Edgeでは環境変数が利用できないためハードコードする
  const BUCKET = "your-bucket-name";
  const S3 = new AWS.S3({ region: "ap-northeast-1" });

  const response = event.Records[0].cf.response;

  console.log(`Response status code: ${response.status}`);

  // 画像が存在しない場合
  if (response.status === "403" || response.status === "404") {
    const request = event.Records[0].cf.request;
    const requestUri = request.uri;
    const subRequestUri = requestUri.substring(1);
    console.log(`requestUri: ${requestUri} -> subRequestUri: ${subRequestUri}`);

    // オリジナル画像のキーを取得
    const originalKey = subRequestUri.replace(".thumb", "");
    console.log(`Original image: ${originalKey}`);

    try {
      // オリジナル画像を取得
      const data = await S3.getObject({
        Bucket: BUCKET,
        Key: originalKey,
      }).promise();
      console.log("S3.getObject success");

      if (!(data.Body instanceof Buffer)) {
        console.log("data.Body is not a Buffer");
        return response;
      }
      const buffer = Buffer.from(data.Body);
      console.log(`buffer length: ${buffer.length}`);

      // jimpのデコーダーをカスタマイズしてメモリ使用量を緩和する
      // See. https://github.com/jimp-dev/jimp/issues/915
      const cachedJpegDecoder = Jimp.decoders["image/jpeg"];
      Jimp.decoders["image/jpeg"] = (data) => {
        const userOpts = { maxMemoryUsageInMB: 4096 };
        // @ts-ignore
        return cachedJpegDecoder(data, userOpts);
      };

      const image = await Jimp.read(buffer);
      console.log(`Image read: ${image.getWidth()}x${image.getHeight()}`);

      // 画像をリサイズ（縦横150px上限）
      image.resize(150, Jimp.AUTO);
      console.log(`Image resized: ${image.getWidth()}x${image.getHeight()}`);

      const mimeType = image._originalMime;
      console.log(`MIME type: ${mimeType}`);
      const resizedBuffer = await image.getBufferAsync(mimeType);

      // 変換後の画像ファイルをS3に保存する
      await S3.putObject({
        Body: resizedBuffer,
        Bucket: BUCKET,
        ContentType: mimeType,
        CacheControl: "max-age=31536000",
        Key: subRequestUri,
        StorageClass: "STANDARD",
      }).promise();
      console.log("S3.putObject success");

      // 変換後の画像ファイルをそのままCloudFrontからのレスポンスとして利用する
      response.status = "200";
      response.body = resizedBuffer.toString("base64");
      response.bodyEncoding = "base64";
      response.headers["content-type"] = [
        { key: "Content-Type", value: mimeType },
      ];

      return response;
    } catch (err) {
      console.log("Exception while processing image: %j", err);
      return response;
    }
  } else {
    // 画像が存在する場合
    console.log("Image exists");
    return response;
  }
};
