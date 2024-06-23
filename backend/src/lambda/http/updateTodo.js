import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { createLogger } from "../../utils/logger.mjs";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB());

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
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);

    logger.info(`Update todo: ${todoId}, done: ${event.body}`);

    await dynamoDbClient.update({
      TableName: todosTable,
      Key: todoId,
      UpdateExpression: "SET name = :name, dueDate = :dueDate, done = :done",
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
