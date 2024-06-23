import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { getUserId } from "../utils.mjs";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB());

const todosTable = process.env.TODOS_TABLE;

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event);

    const result = await dynamoDbClient.query({
      TableName: todosTable,
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
