import { APIGatewayProxyResult } from 'aws-lambda';

export function formatResponse(statusCode: number, data: Object): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
}
