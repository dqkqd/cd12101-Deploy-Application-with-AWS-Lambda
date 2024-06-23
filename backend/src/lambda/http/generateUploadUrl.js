import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { createLogger } from "../../utils/logger.mjs";

const s3Client = new S3Client();

const bucketName = process.env.TODOS_IMAGE_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

const logger = createLogger("generateUploadUrl");

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration,
    });

    logger.info(`Created url for todo ${todoId}: ${url}`);

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url,
      }),
    };
  });
