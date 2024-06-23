import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import AWSXRay from 'aws-xray-sdk-core';
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const dynamodb = AWSXRay.captureAWSv3Client(new DynamoDB());
const dynamoDbClient = DynamoDBDocument.from(dynamodb);

const todosTable = process.env.TODOS_TABLE;
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;

const logger = createLogger("getTodos");

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event);

    logger.info(`Get all todos for user: ${userId}`);

    const result = await dynamoDbClient.query({
      TableName: todosTable,
      IndexName: todosCreatedAtIndex,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });
    const items = result.Items;

    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
      }),
    };
  });
