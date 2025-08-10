import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { ProxyRoute } from '../domain/proxy';
import { IAuthenticationProxy } from '../domain/authentication-proxy';
import { logErrorAndFormat } from '../shared/error';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Hasher } from '../../infra/cryptography/Hasher';
import { AuthenticationRepository } from '../../infra/repositories/AuthenticationRepository';
import { AuthenticationService } from '../../data/services/Authentication';
import { signupSchema } from '../../domain/models/Authentication';
import { formatResponse } from '../shared/response';

const hasher = new Hasher(10);
const dynamo = new DynamoDB();
const authenticationRepository = new AuthenticationRepository(dynamo);
const authenticationService = new AuthenticationService(authenticationRepository, hasher);

class Authentication {
  static async signup(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    try {
      const body = JSON.parse(event.body ?? '{}');
      const input = signupSchema.parse(body);

      const result = await authenticationService.signup(input);

      return formatResponse(200, result);
    } catch (error) {
      return logErrorAndFormat(error);
    }
  }
}

const proxy: IAuthenticationProxy = Authentication;

const routes: ProxyRoute = {
  'POST /signup': proxy.signup,
};

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const route = routes[event.routeKey];
  return route
    ? await route(event)
    : { statusCode: 404, body: `Request path ${event.routeKey} not found` };
};
