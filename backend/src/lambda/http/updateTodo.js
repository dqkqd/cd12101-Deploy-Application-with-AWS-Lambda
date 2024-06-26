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

const logger = createLogger("updateTodo");

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;

    const updatedTodo = JSON.parse(event.body);

    logger.info(`Update todo: ${todoId}, done: ${event.body}`);

    await dynamoDbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: "SET #n = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        "#n": "name"
      },
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done,
      },
    });

    return {
      statusCode: 204,
    };
  });
