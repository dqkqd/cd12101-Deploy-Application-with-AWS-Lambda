import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB());

const todosTable = process.env.TODOS_TABLE;

const logger = createLogger("deleteTodo");

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

    logger.info(`Delete todo ${todoId} from user ${userId}`);

    await dynamoDbClient.delete({
      TableName: todosTable,
      Key: {
        userId,
        todoId,
      },
    });

    return {
      statusCode: 204,
    };
  });
