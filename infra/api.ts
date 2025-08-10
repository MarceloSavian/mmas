import { loadConfig } from './config';
import { mmasTable } from './database';

const config = loadConfig();

const api = new sst.aws.ApiGatewayV2('MMASApi', {
  domain: {
    name: config.domain,
    path: 'v1',
    cert: config.certificateArn,
  },
  link: [mmasTable],
});

api.route('POST /signup', {
  handler: 'functions/handlers/api/authentication-v1.handler',
});

export { api };
