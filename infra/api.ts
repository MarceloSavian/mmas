import { loadConfig } from './config';

const config = loadConfig();

const api = new sst.aws.ApiGatewayV2('MMASApi', {
  domain: {
    name: config.domain,
    path: 'v1',
    cert: config.certificateArn,
  },
});

api.route('POST /signup', {
  handler: 'packages/functions/src/api/authentication-v1.handler',
});

export { api };
