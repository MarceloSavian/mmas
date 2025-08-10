import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

export interface IAuthenticationProxy {
  signup(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult>;
  login(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult>;
}
