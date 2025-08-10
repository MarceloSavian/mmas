import { loadConfig } from './config';
import { mmasTable } from './database';
import { emailSES } from './email';
import { jwtSecret } from './secrets';

const config = loadConfig();

const api = new sst.aws.ApiGatewayV2('MMASApi', {
  domain: {
    name: config.domain,
    path: 'v1',
    cert: config.certificateArn,
  },
  link: [mmasTable, jwtSecret, emailSES],
});

api.route('POST /signup', {
  handler: 'functions/handlers/api/authentication-v1.handler',
});

api.route('POST /login', {
  handler: 'functions/handlers/api/authentication-v1.handler',
});

api.route('POST /mfa-check', {
  handler: 'functions/handlers/api/authentication-v1.handler',
});

export { api };
