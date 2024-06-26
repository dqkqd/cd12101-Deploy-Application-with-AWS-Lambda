import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import AWSXRay from 'aws-xray-sdk-core';
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const dynamodb = AWSXRay.captureAWSv3Client(new DynamoDB());
const dynamoDbClient = DynamoDBDocument.from(dynamodb);

const todosTable = process.env.TODOS_TABLE;
const bucketName = process.env.TODOS_IMAGE_S3_BUCKET;

const logger = createLogger("createTodo");

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event);
    const parsedTodo = JSON.parse(event.body);

    logger.info(`Create todo item for user: ${userId} with params: ${event.body}`);

    const todoId = uuidv4();

    const newTodo = {
      todoId,
      userId,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
      createdAt: new Date().toISOString(),
      done: false,
      ...parsedTodo,
    };

    await dynamoDbClient.put({
      TableName: todosTable,
      Item: newTodo,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodo,
      }),
    };
  });
