import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB());

const todosTable = process.env.TODOS_TABLE;
const todosUserIdIndex = process.env.TODOS_USER_ID_INDEX;

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
      IndexName: todosUserIdIndex,
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
