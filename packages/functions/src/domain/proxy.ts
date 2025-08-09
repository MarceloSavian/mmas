import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

export type ProxyRoute = {
  [key: string]: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResult>;
};
