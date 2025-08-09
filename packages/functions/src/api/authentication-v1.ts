import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { ProxyRoute } from '../domain/proxy';
import { IAuthenticationProxy } from '../domain/authentication-proxy';
import { logErrorAndFormat } from '../shared/error';
import { signupSchema } from '@mmas/core';

class Authentication {
  static async signup(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    try {
      const body = JSON.parse(event.body ?? '{}');
      const input = signupSchema.parse(body);

      return {
        statusCode: 200,
        body: JSON.stringify(input),
      };
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
